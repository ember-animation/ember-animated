import { schedule, cancel } from '@ember/runloop';
import { warn } from '@ember/debug';
import RSVP from 'rsvp';

export let Promise;
if (window.Promise) {
  Promise = window.Promise;
} else {
  warn("Unable to achieve proper rAF timing on this browser, microtask-based Promise implementation needed.", false, { id: "ember-animated-missing-microtask" });
  Promise = RSVP.Promise;
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
  let promise = new Promise(resolve => {
    nextFrameWaiters.push(resolve);
  });
  promise.__ec_cancel__ = removeWaiter.bind(promise);
  return promise;
}

function rAFDidFire(clock) {
  nextFrame = null;
  currentFrameClock = clock;
  let waiters = nextFrameWaiters;
  nextFrameWaiters = [];
  for (let i = 0; i < waiters.length; i++) {
    waiters[i]();
  }
}

function removeWaiter() {
  let index = nextFrameWaiters.indexOf(this);
  if (index > -1) {
    nextFrameWaiters.splice(index, 1);
  }
}

let nextFrame;
let nextFrameWaiters = [];
if (typeof requestAnimationFrame === 'undefined') {
  throw new Error("missing requestAnimationFrame");
}

// rAF guarantees that callbacks within the same frame will see the
// same clock. We stash it here so that arbitrary code can easily ask
// "did I already do that this frame?" without needing to thread the
// clock values around.
export let currentFrameClock = null;

export function microwait() {
  return new Promise(resolve => resolve());
}

export function wait(ms=0) {
  let ticket;
  let promise = new RSVP.Promise(resolve => {
    ticket = setTimeout(resolve, ms);
  });
  promise.__ec_cancel__ = () => {
    clearTimeout(ticket);
  };
  return promise;
}



export function afterRender() {
  let ticket;
  let promise = new Promise(resolve => {
    ticket = schedule('afterRender', resolve);
  });
  promise.__ec_cancel__ = () => {
    cancel(ticket);
  };
  return promise;
}

// This provides a unified place to hook into time control for testing.
export let clock = {
  now() {
    return (new Date()).getTime();
  }
}

export function allSettled(promises) {
  return Promise.all(promises.map(p => {
    if (p) {
      return p.catch(() => null);
    }
  }));
}
