import { Promise } from 'ember-animated/concurrency-helpers';
import { makeCancelable } from 'ember-animated/cancelation';
import { module, test } from 'qunit';
import { macroWait } from 'ember-animated/test-helpers';

module("Unit | cancelation");

test('make cancelable', function(assert) {
  let didRun = false;
  let heardCancel = false;
  let resolve;
  let p = makeCancelable(
    new Promise(r => resolve = r),
    () => heardCancel = true
  );
  p.then(() => didRun = true);
  p.__ec_cancel__();
  resolve();
  assert.ok(!didRun, "was canceled");
  assert.ok(heardCancel, "heard cancel");
});

test('derived promise is cancelable', function(assert) {
  let didRun = false;
  let heardCancel = false;
  let resolve;
  let p = makeCancelable(
    new Promise(r => resolve = r),
    () => heardCancel = true
  )
      .then(() => 42);
  p.then(() => didRun = true);
  p.__ec_cancel__();
  resolve();
  assert.ok(!didRun, "was canceled");
  assert.ok(heardCancel, "heard cancel");
});

test('promise replacing rAF is cancelable', function(assert) {
  let didRun = false;
  let heardCancel = false;
  let resolveFirst, resolveSecond;
  let p = makeCancelable(new Promise(r => resolveFirst = r))
      .then(() => {
        return makeCancelable(
          new Promise(r => resolveSecond = r),
          () => heardCancel = true
        );
      });
  p.then(() => didRun = true);
  resolveFirst();
  return macroWait().then(() => {
    p.__ec_cancel__();
    resolveSecond();
    return macroWait();
  }).then(() => {
    assert.ok(!didRun, "was canceled");
    assert.ok(heardCancel, "heard cancel");
  });
});

test('promise replacing rAF via error handler is cancelable', function(assert) {
  let didRun = false;
  let heardCancel = false;
  let rejectFirst, resolveSecond;
  let p = makeCancelable(new Promise((_, r) => rejectFirst = r))
      .catch(() => {
        return makeCancelable(
          new Promise(r => resolveSecond = r),
          () => heardCancel = true
        );
      });
  p.then(() => didRun = true);
  rejectFirst();
  return macroWait().then(() => {
    p.__ec_cancel__();
    resolveSecond();
    return macroWait();
  }).then(() => {
    assert.ok(!didRun, "was canceled");
    assert.ok(heardCancel, "heard cancel");
  });
});

test('Promise.resolve propagates cancelation', function(assert) {
  let didRun = false;
  let heardCancel = false;
  let resolve;
  let p = Promise.resolve(makeCancelable(
    new Promise(r => resolve = r),
    () => heardCancel = true
  ));
  p.then(() => didRun = true);
  p.__ec_cancel__();
  resolve();
  assert.ok(!didRun, "was canceled");
  assert.ok(heardCancel, "heard cancel");
});
