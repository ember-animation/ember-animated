import { module, test } from 'qunit';
import { task } from 'ember-animated/ember-scheduler';
import { installLogging } from '../helpers/assertions';
import Ember from 'ember';
import { Promise, microwait } from 'ember-animated/concurrency-helpers';

module("Unit | scheduler Ember layer", {
  beforeEach(assert) {
    installLogging(assert);
    assert.insideRunLoop = function(message) {
      let result = insideRunLoop();
      this.pushResult({
        result,
        actual: result ? 'no exception thrown' : 'autorun exception thrown',
        expected: 'no exception thrown',
        message
      });
    }
  }
});

test('sanity check the runloop assertion', function(assert) {
  assert.ok(!insideRunLoop(), 'should be not inside');
  Ember.run(() => {
    assert.ok(insideRunLoop(), 'should be inside');
  });
});

test('task starts synchronously and sets on self', function(assert) {
  let Class = Ember.Object.extend({
    hello: task(function * () {
      this.set('foo', 'bar');
    })
  });
  let object = Class.create();
  let done = assert.async();
  Ember.run(() => {
    object.get('hello').perform().then(done);
    assert.equal(object.get('foo'), 'bar');
  });
});

test('task sees self running', function(assert) {
  assert.expect(1);
  let Class = Ember.Object.extend({
    hello: task(function * () {
      assert.equal(this.get('hello.concurrency'), 1);
    })
  });
  let object = Class.create();
  let done = assert.async();
  Ember.run(() => {
    object.get('hello').perform().then(done);
  });
});

test('synchronously done task stops running immediately', function(assert) {
  assert.expect(1);
  let Class = Ember.Object.extend({
    hello: task(function * () {})
  });
  let object = Class.create();
  let done = assert.async();
  Ember.run(() => {
    object.get('hello').perform().then(done);
    assert.equal(object.get('hello.concurrency'), 0);
  });
});

test('perform resolves appropriately', function(assert) {
  let resolve;
  let didResolve = false;
  let Class = Ember.Object.extend({
    hello: task(function * () {
      yield new Promise(r => resolve = r);
    })
  });
  let object = Class.create();
  let done = assert.async();
  Ember.run(() => {
    object.get('hello').perform().then(() => {
      assert.ok(didResolve, 'should only get here after didResolve');
    }).then(done);
  });
  Ember.run.later(() => {
    assert.equal(object.get('hello.concurrency'), 1);
    didResolve = true;
    resolve();
  });
});

test('still in run loop after yield', function(assert) {
  let resolve;
  let Class = Ember.Object.extend({
    hello: task(function * () {
      yield new Promise(r => resolve = r);
      assert.insideRunLoop();
    })
  });
  let object = Class.create();
  let promise;
  Ember.run(() => {
    promise = object.get('hello').perform();
  });
  setTimeout(() => {
    resolve();
  }, 0);
  return promise;
});

test('task is canceled when object is destroyed', function(assert) {
  let Class = Ember.Object.extend({
    hello: task(function * () {
      let p = new Promise(() => null);
      p.__ec_cancel__ = () => assert.log("task canceled");
      yield p;
    })
  });
  let object = Class.create();
  Ember.run(() => {
    object.get('hello').perform();
    object.destroy();
  });
  assert.logEquals(['task canceled']);
});


test('allows object to be safely destroyed by its own task', function(assert) {
  assert.expect(1);
  let done = assert.async();
  let Class = Ember.Object.extend({
    hello: task(function * () {
      yield microwait();
      this.destroy();
    }),
    willDestroy() {
      assert.ok("will destroy ran");
      done();
    }
  });
  let object = Class.create();
  Ember.run(() => {
    object.get('hello').perform();
  });
});


test('restartable task', function(assert) {
  let Class = Ember.Object.extend({
    hello: task(function * (shouldBlock) {
      assert.log("task starting");
      if (shouldBlock) {
        let p = new Promise(() => null);
        p.__ec_cancel__ = () => assert.log("task canceled");
        try {
          yield p;
        } finally {
          assert.log("task exiting");
        }
      }
    }).restartable()
  });
  let object = Class.create();
  let promise;
  Ember.run(() => {
    object.get('hello').perform(true);
  });
  Ember.run(() => {
    promise = object.get('hello').perform(false);
  });
  return promise.then(() => {
    assert.logEquals(['task starting', 'task canceled', 'task exiting', 'task starting']);
    assert.equal(object.get('hello.concurrency'), 0);
  });
});

test('can use derived state', function(assert) {
  let resolve;
  let Class = Ember.Object.extend({
    hello: task(function * () {
      yield new Promise(r => resolve = r);
    }),
    message: Ember.computed('hello.isRunning', function() {
      return this.get('hello.isRunning') ? 'yup' : 'nope';
    })
  });
  let object = Class.create();
  let promise;
  Ember.run(() => {
    assert.equal(object.get('message'), 'nope', 'initial state');
    promise = object.get('hello').perform();
    assert.equal(object.get('message'), 'yup', 'running state');
  });
  setTimeout(() => {
    resolve();
  }, 0);
  return promise.then(() => {
    assert.equal(object.get('hello.concurrency'), 0, 'final concurrency');
    assert.equal(object.get('hello.isRunning'), false, 'final isRunning');
    assert.equal(object.get('message'), 'nope', 'final state');
  });
});

test('can perform tasks based on observation', function(assert) {
  let Class = Ember.Object.extend({
    hello: task(function * () {
      assert.log("ok");
    }).observes('foo')
  });
  let object = Class.create();

  Ember.run(() => {
    object.set('foo', 'bar');
  });

  assert.logEquals(['ok']);

});

test('returns final value from generator function', function(assert) {
  let Class = Ember.Object.extend({
    hello: task(function * () {
      yield microwait();
      return 42;
    })
  });
  let object = Class.create();
  let promise;
  Ember.run(() => {
    promise = object.get('hello').perform();
  });
  return promise.then(value => {
    assert.equal(value, 42);
  });

});

test('task promise exposes microtask timing, not ember run loop', function(assert) {
  let Class = Ember.Object.extend({
    hello: task(function * () {})
  });
  let object = Class.create();
  let promise;
  Ember.run(() => {
    promise = object.get('hello').perform();
  });
  return promise.then(() => {
    assert.ok(!insideRunLoop());
  });
});

test('nested performs are cancelable', function(assert) {
  let Class = Ember.Object.extend({
    outer: task(function * () {
      try {
        yield this.get('inner').perform();
      } finally {
        assert.log('leaving outer');
      }
    }),
    inner: task(function * () {
      let p = new Promise(() => null);
      p.__ec_cancel__ = () => assert.log('canceled');
      try {
        yield p;
      } finally {
        assert.log('leaving inner');
      }
    })
  });
  let object = Class.create();

  Ember.run(() => {
    object.get('outer').perform();
    object.get('outer').cancelAll();
  });
  assert.logEquals(['canceled', 'leaving inner', 'leaving outer']);
});


function insideRunLoop() {
  try {
    Ember.run.cancel(Ember.run.schedule('actions', function() {}));
    return true;
  } catch(err) {
    if (!/autorun/.test(err.message)) {
      throw err;
    }
    return false;
  }
}
