import { schedule, cancel } from '@ember/runloop';
import type { EmberRunTimer } from '@ember/runloop/types';
import { getOrCreate as _getOrCreate } from './singleton';

function getOrCreate<T>(key: string, construct: () => T): T {
  return _getOrCreate(`concurrency-helpers.${key}`, construct);
}

interface iFrameState {
  nextFrame: number | null;
  currentFrameClock: number;
  nextFrameWaiters: { promise: Promise<any>; resolve: () => void }[];
}

export const frameState = getOrCreate(
  'frameState',
  () =>
    ({
      nextFrame: null,
      nextFrameWaiters: [],
      // rAF guarantees that callbacks within the same frame will see the
      // same clock. We stash it here so that arbitrary code can easily ask
      // "did I already do that this frame?" without needing to thread the
      // clock values around.
      currentFrameClock: -Infinity,
    } as iFrameState),
);

const cancellation = getOrCreate<
  WeakMap<Promise<any>, (p: Promise<any>) => void>
>('cancellation', () => new WeakMap());

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
  if (!frameState.nextFrame) {
    frameState.nextFrame = requestAnimationFrame(rAFDidFire);
  }
  let resolve;
  let promise = new Promise((r) => {
    resolve = r;
  });
  frameState.nextFrameWaiters.push({
    resolve: resolve as any as () => void,
    promise,
  });
  registerCancellation(promise, removeWaiter);
  return promise;
}

function rAFDidFire(clock: number) {
  frameState.nextFrame = null;
  frameState.currentFrameClock = clock;
  let waiters = frameState.nextFrameWaiters;
  frameState.nextFrameWaiters = [];
  for (const waiter of waiters) {
    waiter.resolve();
  }
}

function removeWaiter(promise: Promise<any>) {
  let pair = frameState.nextFrameWaiters.find(
    (pair) => pair.promise === promise,
  );
  if (pair) {
    let index = frameState.nextFrameWaiters.indexOf(pair);
    if (index > -1) {
      frameState.nextFrameWaiters.splice(index, 1);
    }
  }
}

export function microwait(): Promise<void> {
  return new Promise((resolve) => resolve());
}

export function wait(ms = 0): Promise<void> {
  if (clock.now === originalClock) {
    let ticket: number;
    let promise = new Promise<void>((resolve) => {
      ticket = window.setTimeout(resolve, ms);
    });
    registerCancellation(promise, () => {
      clearTimeout(ticket);
    });
    return promise;
  } else {
    let canceled = false;
    let started = clock.now();
    let promise = new Promise<void>((resolve) => {
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
  let promise = new Promise<void>((resolve) => {
    ticket = schedule('afterRender', () => resolve());
  });
  registerCancellation(promise, () => {
    cancel(ticket);
  });
  return promise;
}

// This provides a unified place to hook into time control for testing.
export let clock = getOrCreate('clock', () => ({
  now() {
    return new Date().getTime();
  },
}));

const originalClock = getOrCreate('originalClock', () => clock.now);

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
