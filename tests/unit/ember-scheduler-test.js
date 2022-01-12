/* eslint-disable ember/no-classic-classes */
import EmberObject, { computed } from '@ember/object';
import { run, later } from '@ember/runloop';
import { module, test } from 'qunit';
import { task } from 'ember-animated/-private/ember-scheduler';
import { installLogging } from '../helpers/assertions';
import { microwait } from 'ember-animated';
import { registerCancellation } from 'ember-animated/-private/concurrency-helpers';

module('Unit | scheduler Ember layer', function (hooks) {
  hooks.beforeEach(function (assert) {
    installLogging(assert);
    assert.insideRunLoop = function (message) {
      let result = insideRunLoop();
      this.pushResult({
        result,
        actual: result ? 'no exception thrown' : 'autorun exception thrown',
        expected: 'no exception thrown',
        message,
      });
    };
  });

  test('sanity check the runloop assertion', function (assert) {
    assert.expect(2);

    assert.false(insideRunLoop(), 'should be not inside');
    run(() => {
      assert.true(insideRunLoop(), 'should be inside');
    });
  });

  test('task starts synchronously and sets on self', function (assert) {
    assert.expect(1);

    let Class = EmberObject.extend({
      hello: task(function* () {
        this.set('foo', 'bar');
      }),
    });
    let object = Class.create();
    let done = assert.async();
    run(() => {
      object
        .get('hello')
        .perform()
        .then(() => done());
      assert.strictEqual(object.get('foo'), 'bar');
    });
  });

  test('task sees self running', function (assert) {
    assert.expect(1);
    let Class = EmberObject.extend({
      hello: task(function* () {
        assert.strictEqual(this.get('hello.concurrency'), 1);
      }),
    });
    let object = Class.create();
    let done = assert.async();
    run(() => {
      object
        .get('hello')
        .perform()
        .then(() => done());
    });
  });

  test('synchronously done task stops running immediately', function (assert) {
    assert.expect(1);
    let Class = EmberObject.extend({
      hello: task(function* () {}),
    });
    let object = Class.create();
    let done = assert.async();
    run(() => {
      object
        .get('hello')
        .perform()
        .then(() => done());
      assert.strictEqual(object.get('hello.concurrency'), 0);
    });
  });

  test('perform resolves appropriately', function (assert) {
    assert.expect(2);

    let resolve;
    let didResolve = false;
    let Class = EmberObject.extend({
      hello: task(function* () {
        yield new Promise((r) => (resolve = r));
      }),
    });
    let object = Class.create();
    let done = assert.async();
    run(() => {
      object
        .get('hello')
        .perform()
        .then(() => {
          assert.ok(didResolve, 'should only get here after didResolve');
        })
        .then(() => done());
    });
    later(() => {
      assert.strictEqual(object.get('hello.concurrency'), 1);
      didResolve = true;
      resolve();
    });
  });

  test('still in run loop after yield', function (assert) {
    let resolve;
    let Class = EmberObject.extend({
      hello: task(function* () {
        yield new Promise((r) => (resolve = r));
        assert.insideRunLoop();
      }),
    });
    let object = Class.create();
    let promise;
    run(() => {
      promise = object.get('hello').perform();
    });
    setTimeout(() => {
      resolve();
    }, 0);
    return promise;
  });

  test('task is canceled when object is destroyed', function (assert) {
    let Class = EmberObject.extend({
      hello: task(function* () {
        let p = new Promise(() => null);
        registerCancellation(p, () => assert.log('task canceled'));
        yield p;
      }),
    });
    let object = Class.create();
    run(() => {
      object.get('hello').perform();
      object.destroy();
    });
    assert.logEquals(['task canceled']);
  });

  test('task refuses to start on destroyed object', function (assert) {
    assert.expect(1);

    let Class = EmberObject.extend({
      hello: task(function* () {
        assert.ok(false, 'should not run');
        yield new Promise(() => null);
      }),
    });
    let object = Class.create();
    run(() => {
      object.destroy();
    });
    assert.throws(
      () => object.get('hello').perform(),
      /Tried to perform task hello on an already destroyed object/,
    );
  });

  test('allows object to be safely destroyed by its own task', function (assert) {
    assert.expect(1);
    let done = assert.async();
    let Class = EmberObject.extend({
      hello: task(function* () {
        yield microwait();
        this.destroy();
      }),
      willDestroy() {
        assert.ok('will destroy ran');
        done();
      },
    });
    let object = Class.create();
    run(() => {
      object.get('hello').perform();
    });
  });

  test('restartable task', function (assert) {
    assert.expect(2);

    let Class = EmberObject.extend({
      hello: task(function* (shouldBlock) {
        assert.log('task starting');
        if (shouldBlock) {
          let p = new Promise(() => null);
          registerCancellation(p, () => assert.log('task canceled'));
          try {
            yield p;
          } finally {
            assert.log('task exiting');
          }
        }
      }).restartable(),
    });
    let object = Class.create();
    let promise;
    run(() => {
      object.get('hello').perform(true);
    });
    run(() => {
      promise = object.get('hello').perform(false);
    });
    return promise.then(() => {
      assert.logEquals([
        'task starting',
        'task canceled',
        'task exiting',
        'task starting',
      ]);
      assert.strictEqual(object.get('hello.concurrency'), 0);
    });
  });

  test('drop task', function (assert) {
    assert.expect(2);

    let Class = EmberObject.extend({
      hello: task(function* (id, blockerPromise) {
        assert.log(`task ${id} starting`);
        try {
          if (blockerPromise) {
            registerCancellation(blockerPromise, () =>
              assert.log(`task ${id} canceled`),
            );
            yield blockerPromise;
          }
        } finally {
          assert.log(`task ${id} exiting`);
        }
      }).drop(),
    });
    let object = Class.create();
    let promise, unblock;
    run(() => {
      promise = object
        .get('hello')
        .perform('1', new Promise((r) => (unblock = r)));
    });
    run(() => {
      object.get('hello').perform('2', new Promise(() => {}));
      unblock();
    });
    return promise.then(() => {
      assert.logEquals(['task 1 starting', 'task 1 exiting']);
      assert.strictEqual(object.get('hello.concurrency'), 0);
    });
  });

  test('can use derived state', function (assert) {
    assert.expect(5);

    let resolve;
    let Class = EmberObject.extend({
      hello: task(function* () {
        yield new Promise((r) => (resolve = r));
      }),
      message: computed('hello.isRunning', function () {
        return this.get('hello.isRunning') ? 'yup' : 'nope';
      }),
    });
    let object = Class.create();
    let promise;
    run(() => {
      assert.strictEqual(object.get('message'), 'nope', 'initial state');
      promise = object.get('hello').perform();
      assert.strictEqual(object.get('message'), 'yup', 'running state');
    });
    setTimeout(() => {
      resolve();
    }, 0);
    return promise.then(() => {
      assert.strictEqual(
        object.get('hello.concurrency'),
        0,
        'final concurrency',
      );
      assert.false(object.get('hello.isRunning'), 'final isRunning');
      assert.strictEqual(object.get('message'), 'nope', 'final state');
    });
  });

  test('can perform tasks based on observation', async function (assert) {
    let Class = EmberObject.extend({
      hello: task(function* () {
        assert.log('ok');
      }).observes('foo'),
    });
    let object = Class.create();
    run(() => {
      object.set('foo', 'bar');
    });
    await assert.waitUntilLogContains('ok');
    assert.logEquals(['ok']);
  });

  test('returns final value from generator function', function (assert) {
    assert.expect(1);

    let Class = EmberObject.extend({
      hello: task(function* () {
        yield microwait();
        return 42;
      }),
    });
    let object = Class.create();
    let promise;
    run(() => {
      promise = object.get('hello').perform();
    });
    return promise.then((value) => {
      assert.strictEqual(value, 42);
    });
  });

  test('task promise exposes microtask timing, not ember run loop', async function (assert) {
    let Class = EmberObject.extend({
      hello: task(function* () {}),
    });
    let object = Class.create();
    let promise;
    run(() => {
      promise = object.get('hello').perform();
    });
    await promise;

    assert.notOk(insideRunLoop());
  });

  test('nested performs are cancelable', function (assert) {
    let Class = EmberObject.extend({
      outer: task(function* () {
        try {
          yield this.get('inner').perform();
        } finally {
          assert.log('leaving outer');
        }
      }),
      inner: task(function* () {
        let p = new Promise(() => null);
        registerCancellation(p, () => assert.log('canceled'));
        try {
          yield p;
        } finally {
          assert.log('leaving inner');
        }
      }),
    });
    let object = Class.create();

    run(() => {
      object.get('outer').perform();
      object.get('outer').cancelAll();
      assert.log('cancelAll returned');
    });
    assert.logEquals([
      'canceled',
      'leaving inner',
      'leaving outer',
      'cancelAll returned',
    ]);
  });

  function insideRunLoop() {
    return !!run.currentRunLoop;
  }
});
