import { ownTransform } from 'ember-animated/-private/transform';

export function approxEqualPixels(value, expected, message) {
  // Tolerate errors less than a quarter pixels. This prevents any invisible rounding errors from failing our tests.
  this.pushResult({
    result: Math.abs(value - expected) < 0.25,
    actual: value,
    expected: expected,
    message: message
  });
}

export function equalBounds(value, expected, message) {
  this.pushResult({
    // Tolerate errors less than a quarter pixels. This prevents any invisible rounding errors from failing our tests.
    result: ['bottom', 'height', 'left', 'right', 'top', 'width'].every(field => Math.abs(value[field] - expected[field]) < 0.25),
    actual: value,
    expected: expected,
    message: message
  });
}

function constantBounds(target, fn, message = 'bounds should not change') {
  let before = target[0].getBoundingClientRect();
  fn();
  let after = target[0].getBoundingClientRect();
  equalBounds.call(this, after, before, message);
}

export function equalTransform(value, expected, message) {
  this.pushResult({
    result: ['a', 'b', 'c', 'd', 'tx', 'ty'].every(field => Math.abs(value[field] - expected[field]) < 0.01),
    actual: value,
    expected: expected,
    message: message
  });
}

function equalShape(value, expected, message) {
  this.pushResult({
    result: ['a', 'b', 'c', 'd'].every(field => Math.abs(value[field] - expected[field]) < 0.01),
    actual: { a: value.a, b: value.c, c: value.c, d: value.d },
    expected: { a: expected.a, b: expected.c, c: expected.c, d: expected.d },
    message: message
  });
}

function constantShape(target, fn, message = 'shape should not change') {
  let before = ownTransform(target[0]);
  fn();
  let after = ownTransform(target[0]);
  equalShape.call(this, after, before, message);
}

export function visuallyConstant(target, fn, message) {
  constantShape.call(this, target, () => {
    constantBounds.call(this, target, fn, message);
  }, message);
}

export function installLogging(assert) {
  assert._logBuffer = [];
  assert.log = function(message) {
    this._logBuffer.push(message);
  }
  assert.logEquals = function(value, label) {
    this.deepEqual(this._logBuffer, value, label);
  };
  assert.logContains = function(expected, message) {
    this.pushResult({
      result: this._logBuffer.indexOf(expected) !== -1,
      actual: this._logBuffer,
      expected,
      message
    });
  };
}
