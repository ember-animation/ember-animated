import { schedule, cancel } from '@ember/runloop';
import { getOrCreate as getOrCreate$1 } from './singleton.js';

function getOrCreate(key, construct) {
  return getOrCreate$1(`concurrency-helpers.${key}`, construct);
}
const frameState = getOrCreate('frameState', () => ({
  nextFrame: null,
  nextFrameWaiters: [],
  // rAF guarantees that callbacks within the same frame will see the
  // same clock. We stash it here so that arbitrary code can easily ask
  // "did I already do that this frame?" without needing to thread the
  // clock values around.
  currentFrameClock: -Infinity
}));
const cancellation = getOrCreate('cancellation', () => new WeakMap());
function registerCancellation(promise, handler) {
  cancellation.set(promise, handler);
}
function fireCancellation(promise) {
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
function rAF() {
  if (!frameState.nextFrame) {
    frameState.nextFrame = requestAnimationFrame(rAFDidFire);
  }
  let resolve;
  let promise = new Promise(r => {
    resolve = r;
  });
  frameState.nextFrameWaiters.push({
    resolve: resolve,
    promise
  });
  registerCancellation(promise, removeWaiter);
  return promise;
}
function rAFDidFire(clock) {
  frameState.nextFrame = null;
  frameState.currentFrameClock = clock;
  let waiters = frameState.nextFrameWaiters;
  frameState.nextFrameWaiters = [];
  for (const waiter of waiters) {
    waiter.resolve();
  }
}
function removeWaiter(promise) {
  let pair = frameState.nextFrameWaiters.find(pair => pair.promise === promise);
  if (pair) {
    let index = frameState.nextFrameWaiters.indexOf(pair);
    if (index > -1) {
      frameState.nextFrameWaiters.splice(index, 1);
    }
  }
}
function microwait() {
  return new Promise(resolve => resolve());
}
function wait(ms = 0) {
  if (clock.now === originalClock) {
    let ticket;
    let promise = new Promise(resolve => {
      ticket = window.setTimeout(resolve, ms);
    });
    registerCancellation(promise, () => {
      clearTimeout(ticket);
    });
    return promise;
  } else {
    let canceled = false;
    let started = clock.now();
    let promise = new Promise(resolve => {
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
function afterRender() {
  let ticket;
  let promise = new Promise(resolve => {
    ticket = schedule('afterRender', () => resolve());
  });
  registerCancellation(promise, () => {
    cancel(ticket);
  });
  return promise;
}

// This provides a unified place to hook into time control for testing.
let clock = getOrCreate('clock', () => ({
  now() {
    return new Date().getTime();
  }
}));
const originalClock = getOrCreate('originalClock', () => clock.now);
function allSettled(promises) {
  return Promise.all(promises.map(p => {
    if (p) {
      return p.catch(() => null);
    }
    return;
  }));
}

export { afterRender, allSettled, clock, fireCancellation, frameState, microwait, rAF, registerCancellation, wait };
//# sourceMappingURL=concurrency-helpers.js.map
