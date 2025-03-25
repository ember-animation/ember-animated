import { importSync } from '@embroider/macros';
import { run } from '@ember/runloop';
import { C as Color } from '../color-DWpDqA22.js';
import { relativeBounds } from '../-private/bounds.js';
import { cumulativeTransform } from '../-private/transform.js';
import TimeControl from './time-control.js';
export { default as MotionTester } from './motion-tester.js';
export { default as Sprite } from '../-private/sprite.js';
export { default as Motion } from '../-private/motion.js';
export { AdjustColor } from '../motions/adjust-color.js';
export { Move } from '../motions/move.js';

function animationsSettled() {
  let idle;
  let {
    getContext
  } = importSync('@ember/test-helpers');
  let {
    owner
  } = getContext();
  run(() => {
    idle = owner.lookup('service:-ea-motion').get('waitUntilIdle').perform();
  });
  return Promise.resolve(idle);
}

// This is like getBoundingClientRect, but it is relative to the
// #ember-testing container, so your answers don't change just because
// the container itself is being pushed around by QUnit.
function bounds(element) {
  return relativeBounds(element.getBoundingClientRect(), document.querySelector('#ember-testing').getBoundingClientRect());
}

// This gives you the linear part of the cumulative transformations
// applies to the element, which together form a 2x2 matrix that
// determines its shape.
function shape(element) {
  let transform = cumulativeTransform(element);
  return {
    a: transform.a,
    b: transform.b,
    c: transform.c,
    d: transform.d
  };
}
function boundsAndShape(element) {
  let s = shape(element);
  let b = bounds(element);
  s.width = b.width;
  s.height = b.height;
  s.top = b.top;
  s.left = b.left;
  return s;
}
function checkFields(fields, tolerance, value, expected, message) {
  let filteredActual = Object.create(null);
  let filteredExpected = Object.create(null);
  fields.forEach(field => {
    filteredActual[field] = value[field];
    filteredExpected[field] = expected[field];
  });
  this.pushResult({
    result: fields.every(field => Math.abs(value[field] - expected[field]) < tolerance),
    actual: filteredActual,
    expected: filteredExpected,
    message: message
  });
}
async function visuallyConstant(target, fn, message) {
  let before = boundsAndShape(target);
  await fn();
  let after = boundsAndShape(target);
  checkFields.call(this, ['a', 'b', 'c', 'd', 'top', 'left', 'width', 'height'], 0.25, before, after, message);
}
function approxEqualColors(value, expected, message) {
  const tolerance = 3;
  let valueColor = Color.fromUserProvidedColor(value);
  let expectedColor = Color.fromUserProvidedColor(expected);
  let channels = ['r', 'g', 'b', 'a'];
  this.pushResult({
    result: channels.every(channel => Math.abs(valueColor[channel] - expectedColor[channel]) < tolerance),
    actual: value,
    expected,
    message
  });
}
let time;
function setupAnimationTest(hooks) {
  hooks.beforeEach(function (assert) {
    time = new TimeControl();
    time.runAtSpeed(40);

    // equal checks use a quarter pixel tolerance because we don't care about rounding errors
    assert.equalPosition = checkFields.bind(assert, ['left', 'top'], 0.25);
    assert.equalSize = checkFields.bind(assert, ['height', 'width'], 0.25);
    assert.equalBounds = checkFields.bind(assert, ['height', 'left', 'top', 'width'], 0.25);

    // closeness checks accept a custom pixel tolerance
    assert.closePosition = checkFields.bind(assert, ['left', 'top']);
    assert.closeSize = checkFields.bind(assert, ['height', 'width']);
    assert.closeBounds = checkFields.bind(assert, ['height', 'left', 'top', 'width']);
    assert.visuallyConstant = visuallyConstant;
    assert.approxEqualColors = approxEqualColors;
  });
  hooks.afterEach(function () {
    time.finished();
    time = null;
  });
}

export { TimeControl, animationsSettled, approxEqualColors, bounds, boundsAndShape, setupAnimationTest, shape, time, visuallyConstant };
//# sourceMappingURL=index.js.map
