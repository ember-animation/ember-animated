import { module, test } from 'qunit';
import {
  spawn,
  fork,
  logErrors,
  cancel,
  Scheduler,
  cancelGenerator
} from 'ember-animated/micro-routines';
import { Promise, microwait } from 'ember-animated/concurrency-helpers';

module("Unit | micro-routines", {
  beforeEach(assert) {
    assert._logBuffer = [];
    assert.log = function(message) {
      this._logBuffer.push(message);
    }
    assert.logEquals = function(value, label) {
      this.deepEqual(this._logBuffer, value, label);
    };
  }
});

function spawnAll(funcs, onError) {
  let scheduler = new Scheduler(onError);
  funcs.forEach(f => scheduler.spawn(f()));
  return scheduler.run();
}



['forward', 'reverse'].forEach(order => {
  test(`handles multiple immediate resolutions (${order})`, function(assert) {
    let resolvers = [null, null];
    let expected = ['hello', 'world'];

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
    let g = spawnAll([first, second]);
    let state = g.next();
    assert.ok(!state.done, 'not done');
    if (order === 'reverse') {
      resolvers = resolvers.reverse();
      expected = expected.reverse();
    }
    resolvers[0]();
    resolvers[1]();
    return state.value.then(v => {
      state = g.next(v);
      assert.ok(!state.done, 'still not done');
      return state.value
    }).then(v => {
      state = g.next(v);
      assert.ok(state.done, 'should be done');
      assert.logEquals(expected);
    });
  });
});

test("interrupted generators still run finally", function(assert) {
  function * example() {
    try {
      yield new Promise(() => null);
    } finally {
      assert.log("finally ran");
    }
  }
  let g = spawnAll([example]);
  g.next();
  cancelGenerator(g);
  assert.logEquals(['finally ran']);
});

test("routines can spawn more routines synchronously", function(assert) {
  let scheduler = new Scheduler();
  let count = 0;
  function * example() {
    if (count < 3) {
      count++;
      scheduler.spawn(example());
    }
  }
  scheduler.spawn(example());
  let g = scheduler.run();
  let state = g.next();
  assert.ok(state.done, 'done')
  assert.equal(count, 3);
});

test("routines can spawn more routines asynchronously", function(assert) {
  let scheduler = new Scheduler();
  let resolve, resolve2;
  function * example() {
    yield new Promise(r => resolve = r);
    assert.log("will spawn");
    scheduler.spawn(second());
    assert.log("did spawn");
  }
  function * second() {
    assert.log("sync start");
    yield new Promise(r => resolve2 = r);
    assert.log("final");
  }
  scheduler.spawn(example());
  let g = scheduler.run();
  let state = g.next();
  assert.ok(!state.done, 'not done')
  resolve();
  return state.value.then(v => {
    state = g.next(v);
    assert.ok(!state.done, 'not done 2');
    assert.logEquals(["will spawn", "sync start", "did spawn"]);
    resolve2();
    return state.value
  }).then(v => {
    state = g.next(v);
    assert.ok(state.done, 'done')
    assert.logEquals(["will spawn", "sync start", "did spawn", "final"]);
  });
});

// ----------------------------

test('spawn starts synchronously', function(assert) {
  let p = spawn(function * () {
    assert.log("hello world");
  });
  assert.logEquals(['hello world']);
  return p;
});

test('the return value of the top-level spawned task is resolved', function(assert) {
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

test('top-level fork forbidden', function(assert) {
  assert.throws(() => {
    fork(function *() {
      assert.log("hello world");
    });
  }, /cannot fork/);
  assert.logEquals([]);
});

test('fork a child', function(assert) {
  let resolve;
  let p = spawn(function * () {
    assert.log("parent started");
    fork(function * () {
      assert.log("child started");
      yield new Promise(r => resolve = r);
      assert.log("child finishing");
    });
    assert.log("parent finishing");
    return 42;
  })
  assert.logEquals(["parent started", "child started", "parent finishing"]);
  resolve();
  return p.then(exitStatus => {
    assert.equal(exitStatus, 42);
    assert.logEquals(["parent started", "child started", "parent finishing", "child finishing"]);
  });
});


test('fork starts each child immediately', function(assert) {
  return spawn(function * () {
    fork(function * () {
      assert.log(1);
    });
    fork(function * () {
      assert.log(2);
    });
    assert.logEquals([1,2]);
  });
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
      promises[0] = fork(first);
      promises[1] = fork(second);

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

test('forked child immediately returns promise', function(assert) {
  return spawn(function * () {
    let value = yield fork(function * example() {
      return new Promise(resolve => resolve(42));
    });
    assert.equal(value, 42);
  });
});

test('forked child returns promise', function(assert) {
  return spawn(function * () {
    let resolveFirst;
    let p = fork(function * example() {
      yield new Promise(r => resolveFirst = r);
      return new Promise(resolve => resolve(42));
    });
    resolveFirst();
    assert.equal(yield p, 42);
  });
});

test('forked child immediately throws', function(assert) {
  return spawn(function * () {
    return fork(function * () {
      let b = new Error("boom");
      b.message = 'boom';
      throw b;
    }).catch(err => {
      assert.equal(err.message, 'boom');
    });
  });
});

['forward', 'reverse'].forEach(order => {
  test(`handles post-yield exception (${order})`, function(assert) {

    return spawn(function * () {

      let resolvers = [null, null];
      let promises = [null, null];

      function * first() {
        assert.log(1);
        yield new Promise(r => resolvers[0] = r);
        let e = new Error("boom");
        e.message = 'boom';
        throw e;
      }
      function * second() {
        assert.log(2);
        yield new Promise(r => resolvers[1] = r);
        assert.log(3);
      }

      logErrors(reason => assert.log(reason.message));
      promises[0] = fork(first);
      promises[1] = fork(second);

      if (order === 'reverse') {
        resolvers = resolvers.reverse();
        promises = promises.reverse();
      }

      resolvers[0]();
      yield settle(promises[0]);
      resolvers[1]();
      yield settle(promises[1]);

      if (order === 'forward') {
        assert.logEquals([1, 2, 'boom', 3]);
      } else {
        assert.logEquals([1, 2, 3, 'boom']);
      }
    });
  });
});

test('throws exceptions into child generators', function(assert) {
  return spawn(function * () {
    let reject;
    let p = fork(function * example() {
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

test('can cancel all waiting promises from the outside', function(assert) {
  return spawn(function * () {
    let resolveFirst, resolveSecond;

    let task = spawn(function * () {

      fork(function * example1() {
        yield new Promise(r => resolveFirst = r);
        let third = new Promise(() => null);
        third.__ec_cancel__ = () => assert.log('third canceled');
        yield third;
      });

      fork(function * example2() {
        yield new Promise(r => resolveSecond = r);
        let fourth = new Promise(() => null);
        fourth.__ec_cancel__ = () => assert.log('fourth canceled');
        yield fourth;
      });

    });

    resolveFirst();
    yield microwait();
    resolveSecond();
    yield microwait();
    cancel(task);
    yield microwait();
    assert.logEquals(['third canceled', 'fourth canceled']);
  });
});

test('can cancel all waiting promises from the inside', function(assert) {
  return spawn(function * () {
    let resolveFirst, resolveSecond;
    let canceled;
    let didCancel = new Promise(r => canceled = r);


    let task = spawn(function * () {

      fork(function * example1() {
        yield new Promise(r => resolveFirst = r);
        let third = new Promise(() => null);
        third.__ec_cancel__ = () => assert.log('third canceled');
        yield third;
      });

      fork(function * example2() {
        yield new Promise(r => resolveSecond = r);
        let fourth = new Promise(() => null);
        fourth.__ec_cancel__ = () => assert.log('fourth canceled');
        yield fourth;
      });

      resolveFirst();
      yield microwait();
      resolveSecond();
      yield microwait();
      cancel(task);
      canceled();
      yield microwait();
      assert.ok(false, "should not get here (previous yield throws TaskCancelation)");
    });

    yield didCancel;
    assert.logEquals(['third canceled', 'fourth canceled']);
  });
});

test('fairness', function(assert) {
  return spawn(function * () {

    fork(function * first() {
      yield;
      assert.log(1);
      yield;
      assert.log(2);
      yield;
      assert.log(3);
    });

    fork(function * second() {
      yield;
      assert.log(4);
      yield;
      assert.log(5);
      yield;
      assert.log(6);
    });

  }).then(() => {
    assert.logEquals([1, 4, 2, 5, 3, 6]);
  });
});

test('sync cancelation propagates to inner scheduler', function(assert) {
  return spawn(function * () {
    let task = spawn(function * () {
      yield spawn(function * () {
        let promise = new Promise(() => null);
        promise.__ec_cancel__ = () => assert.log('first canceled');
        yield promise;
      });
    });
    cancel(task);
    yield microwait();
    assert.logEquals(['first canceled']);
  });
});

test('async cancelation propagates to inner scheduler', function(assert) {
  return spawn(function * () {
    let resolve;
    let task = spawn(function * () {
      yield spawn(function * () {
        yield new Promise(r => resolve = r);
        let promise = new Promise(() => null);
        promise.__ec_cancel__ = () => assert.log('first canceled');
        yield promise;
      });
    });
    resolve();
    yield microwait();
    cancel(task);
    yield microwait();
    assert.logEquals(['first canceled']);
  });
});


function settle(promise) {
  return promise.then(() => null, () => null);
}
