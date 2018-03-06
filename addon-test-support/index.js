import { getContext } from '@ember/test-helpers';
import { resolve } from 'rsvp';
import { run } from '@ember/runloop';
import { relativeBounds } from 'ember-animated/-private/bounds';
import TimeControl from './time-control';

export { TimeControl };
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

function checkFields(fields, tolerance, value, expected, message) {
  this.pushResult({

    result: fields.every(field => Math.abs(value[field] - expected[field]) < tolerance),
    actual: value,
    expected: expected,
    message: message
  });
}

export let time;

export function setupAnimationTest(hooks) {
  hooks.beforeEach(function(assert) {
    time = new TimeControl();
    time.runAtSpeed(40);

    // equal checks use a quarter pixel tolerance because we don't care about rounding errors
    assert.equalPosition = checkFields.bind(assert, ['left', 'top'], 0.25);
    assert.equalSize = checkFields.bind(assert, ['height', 'width'], 0.25)
    assert.equalBounds = checkFields.bind(assert, ['height', 'left', 'top', 'width'], 0.25);

    // closeness checks accept a custom pixel tolerance
    assert.closePosition = checkFields.bind(assert, ['left', 'top']);
    assert.closeSize = checkFields.bind(assert, ['height', 'width'])
    assert.closeBounds = checkFields.bind(assert, ['height', 'left', 'top', 'width']);

  });
  hooks.afterEach(function() {
    time.finished();
    time = null;
  });
}
