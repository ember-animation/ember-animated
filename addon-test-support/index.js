import { getContext } from '@ember/test-helpers';
import { resolve } from 'rsvp';
import { run } from '@ember/runloop';
import { relativeBounds } from 'ember-animated/-private/bounds';

export { default as TimeControl } from './time-control';
export { default as MotionTester } from './motion-tester';

export function animationsSettled() {
  let idle;
  let { owner } = getContext();
  run(() => {
    idle = owner.lookup('service:-ea-motion').get('waitUntilIdle').perform();
  });
  return resolve(idle);
}

// This is like getBoundingClientRect, but it is relative to the
// #ember-testing container, so your answers don't change just because
// the container itself is being pushed around by QUnit.
export function bounds(element) {
  return relativeBounds(element.getBoundingClientRect(), document.querySelector('#ember-testing').getBoundingClientRect());
}
