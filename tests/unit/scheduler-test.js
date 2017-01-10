import { module, test } from 'qunit';
import { installLogging } from '../helpers/assertions';
import {
  spawn,
  spawnLinked,
  logErrors,
  stop,
  current,
  childrenSettled
} from 'ember-animated/scheduler';
import { Promise, microwait } from 'ember-animated/concurrency-helpers';

module("Unit | scheduler", {
  beforeEach(assert) {
    installLogging(assert);
  }
});

test('spawn starts synchronously', function(assert) {
  let p = spawn(function * () {
    assert.log("hello world");
  });
  assert.logEquals(['hello world']);
  return p;
});

test('spawn continues asynchronously', function(assert) {
  let p = spawn(function * () {
    assert.log("hello world");
    yield microwait();
    assert.log("goodbye");
  });
  assert.logEquals(['hello world']);
  return p.then(() => {
    assert.logEquals(['hello world', 'goodbye']);
  });
});

test('the return value of the spawned task is resolved', function(assert) {
  return spawn(function * () {
    return 42;
  }).then(value => {
    assert.equal(value, 42);
  });
});

test('spawn synchronous exception', function(assert) {
  return spawn(function * () {
    throw new Error('boom');
  }).then(() => {
    assert.ok(false, "should not get here");
  }, err => {
    assert.equal(err.message, 'boom');
  });
});

test('spawn: asynchronous exception', function(assert) {
  let resolve;
  let p = spawn(function * () {
    yield new Promise(r => resolve = r);
    throw new Error('boom');
  });
  resolve();
  return p.then(() => {
    assert.ok(false, "should not get here");
  }, err => {
    assert.equal(err.message, 'boom');
  });
});

test('spawn within spawn', function(assert) {
  let resolve;
  let p = spawn(function * () {
    assert.log("parent started");
    let child = spawn(function * () {
      assert.log("child started");
      yield new Promise(r => resolve = r);
      assert.log("child finishing");
    });
    assert.log("parent finishing");
    yield child;
    return 42;
  })
  assert.logEquals(["parent started", "child started", "parent finishing"]);
  resolve();
  return p.then(exitStatus => {
    assert.equal(exitStatus, 42);
    assert.logEquals(["parent started", "child started", "parent finishing", "child finishing"]);
  });
});

test('spawn linked child microroutine', function(assert) {
  return spawn(function * () {
    yield spawnLinked(function * () {
      assert.log('child ran');
    });
    assert.logEquals(['child ran']);
  });
});

test('spawned task can enable error logging', function(assert) {
  return spawn(function * () {
    logErrors(err => {
      assert.log('handled message: ' + err.message);
    });
    throw new Error('boom');
  }).then(() => {
    assert.ok(false, "should not get here");
  }, err => {
    assert.equal(err.message, 'boom');
    assert.logEquals(['handled message: boom']);
  });
});

test('error logging is inherited by linked children', function(assert) {
  return spawn(function * () {
    logErrors(err => {
      assert.log('handled message: ' + err.message);
    });
    spawnLinked(function * () {
      throw new Error('boom');
    }).catch(() => {
      assert.log('catching here too') // to avoid console noise
    });
  }).then(() => {
    assert.logEquals(['handled message: boom', 'catching here too']);
  });
});

test('propagating child error is logged once', function(assert) {
  return spawn(function * () {
    logErrors(err => {
      assert.log('handled message: ' + err.message);
    });
    yield spawnLinked(function * () {
      throw new Error('boom');
    })
  }).catch(err => {
    assert.equal(err.message, 'boom');
    assert.logEquals(['handled message: boom']);
  });
});

test('spawnLinked requires a running microroutine', function(assert) {
  assert.throws(() => {
    spawnLinked(function * () {});
  }, /spawnLinked: only works inside a running microroutine/);
});

['forward', 'reverse'].forEach(order => {
  test(`resolves in ${order} order`, function(assert) {
    let resolvers = [null, null];
    let expected = ['hello', 'world'];
    let promises = [null, null];

    function * first() {
      assert.log(yield new Promise(resolve => {
        resolvers[0] = () => resolve('hello');
      }));
    }
    function * second() {
      assert.log(yield new Promise(resolve => {
        resolvers[1] = () => resolve('world');
      }));
    }
    return spawn(function * () {
      promises[0] = spawn(first);
      promises[1] = spawn(second);

      if (order === 'reverse') {
        resolvers = resolvers.reverse();
        expected = expected.reverse();
        promises = promises.reverse();
      }

      resolvers[0]();
      yield promises[0];
      resolvers[1]();
      yield promises[1];
      assert.logEquals(expected);
    });
  });
});

test('immediately returned promise', function(assert) {
  return spawn(function * () {
    let value = yield spawn(function * example() {
      return new Promise(resolve => resolve(42));
    });
    assert.equal(value, 42);
  });
});

test('asynchronously returned promise', function(assert) {
  return spawn(function * () {
    let resolveFirst;
    let p = spawn(function * example() {
      yield new Promise(r => resolveFirst = r);
      return new Promise(resolve => resolve(42));
    });
    resolveFirst();
    assert.equal(yield p, 42);
  });
});

test('rejected promises trigger try/catch', function(assert) {
  return spawn(function * () {
    let reject;
    let p = spawn(function * example() {
      try {
        yield new Promise((_, r) => reject = r);
      } catch(err) {
        assert.log(err);
      }
    });
    reject('something');
    yield p;
    assert.logEquals(['something']);
  });
});

test('can be stopped', function(assert) {
  return spawn(function * () {
    let task = spawn(function * () {
      try {
        let p = new Promise(() => null);
        p.__ec_cancel__ = () => assert.log('cancelation ran');
        yield p;
      } finally {
        assert.log('ran finally');
      }
    });
    stop(task);
    assert.logEquals(['cancelation ran', 'ran finally']);
  });
});

test('can access self', function(assert) {
  return spawn(function * () {
    let innerTask;
    let task = spawn(function * () {
      innerTask = current();
    });
    assert.equal(innerTask, task);
  });
});

test('can stop self', function(assert) {
  return spawn(function * () {
    spawn(function * () {
      stop(current());
      assert.ok(false, "should not get here");
    });
    assert.ok(true, "I get here");
  });
});


test('can cancel all linked microroutines', function(assert) {
  return spawn(function * () {
    let resolveFirst, resolveSecond;

    let task = spawn(function * () {

      spawnLinked(function * example1() {
        yield new Promise(r => resolveFirst = r);
        let third = new Promise(() => null);
        third.__ec_cancel__ = () => assert.log('third canceled');
        try {
          yield third;
        } finally {
          assert.log('third finally');
        }
      });

      spawnLinked(function * example2() {
        yield new Promise(r => resolveSecond = r);
        let fourth = new Promise(() => null);
        fourth.__ec_cancel__ = () => assert.log('fourth canceled');
        try {
          yield fourth;
        } finally {
          assert.log('fourth finally');
        }
      });

    });

    resolveFirst();
    yield microwait();
    resolveSecond();
    yield microwait();
    stop(task);
    yield microwait();
    assert.logContains('third canceled');
    assert.logContains('fourth canceled');
    assert.logContains('third finally');
    assert.logContains('fourth finally');

  });
});

test('can cancel all linked, from the inside', function(assert) {
  return spawn(function * () {

    let stopping;
    let stopped = new Promise(r => stopping = r);

    spawn(function * () {
      let resolveFirst, resolveSecond;

      spawnLinked(function * example1() {
        yield new Promise(r => resolveFirst = r);
        let third = new Promise(() => null);
        third.__ec_cancel__ = () => assert.log('third canceled');
        try {
          yield third;
        } finally {
          assert.log('third finally');
        }
      });

      spawnLinked(function * example2() {
        yield new Promise(r => resolveSecond = r);
        let fourth = new Promise(() => null);
        fourth.__ec_cancel__ = () => assert.log('fourth canceled');
        try {
          yield fourth;
        } finally {
          assert.log('fourth finally');
        }
      });

      resolveFirst();
      yield microwait();
      resolveSecond();
      yield microwait();
      stopping();
      stop(current());

    });

    yield stopped;
    yield microwait();
    assert.logContains('third canceled');
    assert.logContains('fourth canceled');
    assert.logContains('third finally');
    assert.logContains('fourth finally');

  });
});

test('all linked microroutines are canceled if we die', function(assert) {
  assert.expect(5);
  return spawn(function * () {

    let stopping;
    let stopped = new Promise(r => stopping = r);

    spawn(function * () {
      let resolveFirst, resolveSecond;

      spawnLinked(function * example1() {
        yield new Promise(r => resolveFirst = r);
        let third = new Promise(() => null);
        third.__ec_cancel__ = () => assert.log('third canceled');
        try {
          yield third;
        } finally {
          assert.log('third finally');
        }
      });

      spawnLinked(function * example2() {
        yield new Promise(r => resolveSecond = r);
        let fourth = new Promise(() => null);
        fourth.__ec_cancel__ = () => assert.log('fourth canceled');
        try {
          yield fourth;
        } finally {
          assert.log('fourth finally');
        }
      });

      resolveFirst();
      yield microwait();
      resolveSecond();
      yield microwait();
      stopping();
      throw new Error('boom');
    }).catch(err => {
      assert.equal(err.message, 'boom');
    });

    yield stopped;
    yield microwait();
    assert.logContains('third canceled');
    assert.logContains('fourth canceled');
    assert.logContains('third finally');
    assert.logContains('fourth finally');

  });
});

test('fairness', function(assert) {
  return spawn(function * () {

    let a = spawnLinked(function * first() {
      yield;
      assert.log(1);
      yield;
      assert.log(2);
      yield;
      assert.log(3);
    });

    let b = spawnLinked(function * second() {
      yield;
      assert.log(4);
      yield;
      assert.log(5);
      yield;
      assert.log(6);
    });

    yield a;
    yield b;

  }).then(() => {
    assert.logEquals([1, 4, 2, 5, 3, 6]);
  });
});

test('can wait for all linked children', function (assert) {
  return spawn(function * () {
    let resolveFirst, resolveSecond;

    let promise = spawn(function * () {

      spawnLinked(function * example1() {
        yield new Promise(r => resolveFirst = r);
        assert.log('first finishing');
      });

      spawnLinked(function * example2() {
        yield new Promise(r => resolveSecond = r);
        assert.log('second finishing');
        throw new Error('boom');
      });

      assert.log('awaiting children');
      yield childrenSettled();
      assert.log('they finished');
    });

    resolveFirst();
    yield microwait();
    resolveSecond();
    yield promise;

    assert.logEquals(['awaiting children', 'first finishing', 'second finishing', 'they finished']);
  });

});
