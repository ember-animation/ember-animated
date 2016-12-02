import Ember from 'ember';
import RSVP from 'rsvp';

export function macroWait() {
  let ticket;
  let promise = new RSVP.Promise(resolve => {
    ticket = setTimeout(resolve, 0);
  });
  promise.__ec_cancel__ = () => {
    clearTimeout(ticket);
  };
  return promise;
}

// This method must be installed on a context with an owner. Expected
// usage is to put it on an integration test context.
export function waitForAnimations() {
  let idle;
  Ember.run(() => {
    idle = Ember.getOwner(this).lookup('service:-ea-motion').get('waitUntilIdle').perform();
  });
  return idle;
}
