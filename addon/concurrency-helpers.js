import RSVP from 'rsvp';
import Ember from 'ember';

export let Promise;
if (window.Promise) {
  Promise = window.Promise;
} else {
  Ember.warn("Unable to achieve proper rAF timing on this browser, microtask-based Promise implementation needed.", false, { id: "ember-animated-missing-microtask" });
  Promise = RSVP.Promise;
}

// This is a cancelable way to requestAnimationFrame that's designed
// to resolve via the microtask queue (like real spec-compliant
// Promises are supposed to). This lets us use rAF within
// ember-concurrency correctly. RSVP promises within Ember do not
// resolve on the microtask queue, because Ember schedules them inside
// backburner.
export function rAF() {
  if (typeof requestAnimationFrame === 'undefined') {
    throw new Error("missing requestAnimationFrame");
  } else {
    let frame;
    let promise = new Promise(resolve => {
      frame = requestAnimationFrame(function(clock) {
        currentFrameClock = clock;
        resolve();
      });
    });
    promise.__ec_cancel__ = () => cancelAnimationFrame(frame);
    return promise;
  }
}


// rAF guarantees that callbacks within the same frame will see the
// same clock. We stash it here so that arbitrary code can easily ask
// "did I already do that this frame?" without needing to thread the
// clock values around.
export let currentFrameClock = null;

export function microwait() {
  return new Promise(resolve => resolve());
}

export function afterRender() {
  let ticket;
  let promise = new RSVP.Promise(resolve => {
    ticket = Ember.run.scheduleOnce('afterRender', resolve);
  });
  promise.__ec_cancel__ = () => {
    Ember.run.cancel(ticket);
  };
  return promise;
}

// This provides a unified place to hook into time control for testing.
export let clock = {
  now() {
    return (new Date()).getTime();
  }
}
