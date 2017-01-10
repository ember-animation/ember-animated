import { module, test, skip } from 'qunit';
import { task } from 'ember-animated/ember-scheduler';
import { installLogging } from '../helpers/assertions';
import Ember from 'ember';
import { Promise } from 'ember-animated/concurrency-helpers';

module("Unit | micro-routines Ember layer", {
  beforeEach(assert) {
    installLogging(assert);
  }
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

test('can set an observable property on self after yield', function(assert) {
  let resolve;
  let Class = Ember.Object.extend({
    hello: task(function * () {
      yield new Promise(r => resolve = r);
      this.set('foo', 'bar');
    }),
    baz: Ember.computed('foo', function() {
      return this.get('foo') + 'baz';
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
  return promise.then(() => {
    assert.equal(object.get('baz'), 'barbaz');
  });
});

skip('task is canceled when object is destroyed', function(assert) {
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
