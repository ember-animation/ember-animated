import { schedule, cancel } from '@ember/runloop';
import { warn } from '@ember/debug';
import RSVP from 'rsvp';
import { EmberRunTimer } from '@ember/runloop/types';

if (!(window as any).Promise) {
  warn(
    'Unable to achieve proper rAF timing on this browser, microtask-based Promise implementation needed.',
    false,
    { id: 'ember-animated-missing-microtask' },
  );
  window.Promise = RSVP.Promise as any as PromiseConstructor;
}

const cancellation: WeakMap<
  Promise<any>,
  (p: Promise<any>) => void
> = new WeakMap();

export function registerCancellation(
  promise: Promise<any>,
  handler: (p: Promise<any>) => void,
) {
  cancellation.set(promise, handler);
}

export function fireCancellation(promise: Promise<any>) {
  let fn = cancellation.get(promise);
  if (fn) {
    fn(promise);
  }
}

// This is a cancelable way to requestAnimationFrame that's designed
// to resolve via the microtask queue (like real spec-compliant
// Promises are supposed to). This lets us use rAF within
// ember-concurrency correctly. RSVP promises within Ember do not
// resolve on the microtask queue, because Ember schedules them inside
// backburner.
export function rAF() {
  if (!nextFrame) {
    nextFrame = requestAnimationFrame(rAFDidFire);
  }
  let resolve;
  let promise = new Promise((r) => {
    resolve = r;
  });
  nextFrameWaiters.push({ resolve: resolve as any as () => void, promise });
  registerCancellation(promise, removeWaiter);
  return promise;
}

function rAFDidFire(clock: number) {
  nextFrame = null;
  currentFrameClock = clock;
  let waiters = nextFrameWaiters;
  nextFrameWaiters = [];
  for (let i = 0; i < waiters.length; i++) {
    waiters[i].resolve();
  }
}

function removeWaiter(promise: Promise<any>) {
  let pair = nextFrameWaiters.find((pair) => pair.promise === promise);
  if (pair) {
    let index = nextFrameWaiters.indexOf(pair);
    if (index > -1) {
      nextFrameWaiters.splice(index, 1);
    }
  }
}

let nextFrame: number | null = null;
let nextFrameWaiters: { promise: Promise<any>; resolve: () => void }[] = [];

// rAF guarantees that callbacks within the same frame will see the
// same clock. We stash it here so that arbitrary code can easily ask
// "did I already do that this frame?" without needing to thread the
// clock values around.
export let currentFrameClock = -Infinity;

export function microwait(): Promise<void> {
  return new Promise((resolve) => resolve());
}

export function wait(ms = 0) {
  if (clock.now === originalClock) {
    let ticket: number;
    let promise = new RSVP.Promise((resolve) => {
      ticket = window.setTimeout(resolve, ms);
    });
    registerCancellation(promise, () => {
      clearTimeout(ticket);
    });
    return promise;
  } else {
    let canceled = false;
    let started = clock.now();
    let promise = new RSVP.Promise((resolve) => {
      function checkIt() {
        if (!canceled) {
          if (clock.now() - started > ms) {
            resolve();
          }
          rAF().then(checkIt);
        }
      }
      checkIt();
    });
    registerCancellation(promise, () => {
      canceled = true;
    });
    return promise;
  }
}

export function afterRender() {
  let ticket: EmberRunTimer;
  let promise = new Promise((resolve) => {
    ticket = schedule('afterRender', resolve);
  });
  registerCancellation(promise, () => {
    cancel(ticket);
  });
  return promise;
}

// This provides a unified place to hook into time control for testing.
export let clock = {
  now() {
    return new Date().getTime();
  },
};

const originalClock = clock.now;

export function allSettled(promises: Promise<any>[]) {
  return Promise.all(
    promises.map((p) => {
      if (p) {
        return p.catch(() => null);
      }
      return;
    }),
  );
}
