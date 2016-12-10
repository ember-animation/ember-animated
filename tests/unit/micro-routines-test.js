import { module, test } from 'qunit';
import { Scheduler, cancelGenerator } from 'ember-animated/micro-routines';
import { Promise } from 'ember-animated/concurrency-helpers';

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

test('starts each generator immediately', function(assert) {
  function * first() {
    assert.log(1);
  }
  function * second() {
    assert.log(2);
  }
  let g = spawnAll([first, second])
  let result = g.next();
  assert.ok(result.done, 'should be done already');
  assert.logEquals([1, 2]);
});

['forward', 'reverse'].forEach(order => {
  test(`resolves in ${order} order`, function(assert) {
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
    return state.value.then(v => {
      state = g.next(v);
      assert.ok(!state.done, 'still not done');
      resolvers[1]();
      return state.value
    }).then(v => {
      state = g.next(v);
      assert.ok(state.done, 'should be done');
      assert.logEquals(expected);
    });
  });
});

test('finishes immediately after returning non promise', function(assert) {
  let resolve;
  function * example() {
    yield new Promise(r => resolve = r);
  }
  let g = spawnAll([example]);
  let state = g.next();
  assert.ok(!state.done, 'not done');
  resolve();
  return state.value.then(v => {
    state = g.next(v);
    assert.ok(state.done, 'done');
  });
});

test('throws on immediately returned promise', function(assert) {
  function * example() {
    return new Promise(() => null);
  }
  assert.throws(() => {
    spawnAll([example])
  }, "nope");
});

test('fires error handler on returned promise', function(assert) {
  let resolveFirst;
  let error;
  function * example() {
    yield new Promise(r => resolveFirst = r);
    return new Promise(() => null);
  }
  let g = spawnAll([example], err => error = err)
  let state = g.next();
  assert.ok(!state.done, 'not done');
  resolveFirst();
  return state.value.then(v => {
    state = g.next(v);
    assert.ok(state.done, 'done');
    assert.ok(error && error.message === "You may not return a Promise from an animation generator. Yield promises instead.", 'Found error message');
  });
});

test('spawn throws immediate exceptions', function(assert) {
  function * first() {
    let b = new Error("boom");
    b.message = 'boom';
    throw b;
  }
  assert.throws(() => {
    spawnAll([first]);
  }, /boom/);
});

['forward', 'reverse'].forEach(order => {
  test(`handles post-yield exception (${order})`, function(assert) {
    let resolvers = [null, null];
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
    let g = spawnAll([first, second], reason => assert.log(reason.message));
    let state = g.next();
    assert.ok(!state.done, 'not done');
    if (order === 'reverse') {
      resolvers = resolvers.reverse();
    }
    resolvers[0]();
    return state.value.then(v => {
      state = g.next(v);
      assert.ok(!state.done, 'not done again');
      resolvers[1]();
      return state.value;
    }).then(v => {
      state = g.next(v);
      assert.ok(state.done, 'done');
      if (order === 'forward') {
        assert.logEquals([1, 2, 'boom', 3]);
      } else {
        assert.logEquals([1, 2, 3, 'boom']);
      }
    });
  });
});

test('throws exceptions into child generators', function(assert) {
  let reject;
  function * example() {
    try {
      yield new Promise((_, r) => reject = r);
    } catch(err) {
      assert.log(err);
    }
  }
  let g = spawnAll([example]);
  let state = g.next();
  assert.ok(!state.done, 'not done');
  reject('something');
  return state.value.then(v => {
    state = g.next(v);
    assert.ok(state.done, 'done');
    assert.logEquals(['something']);
  });
});

test('can cancel all waiting promises', function(assert) {
  let resolveFirst, resolveSecond;

  function * example1() {
    yield new Promise(r => resolveFirst = r);
    let third = new Promise(() => null);
    third.__ec_cancel__ = () => assert.log('third canceled');
    yield third;
  }

  function * example2() {
    yield new Promise(r => resolveSecond = r);
    let fourth = new Promise(() => null);
    fourth.__ec_cancel__ = () => assert.log('fourth canceled');
    yield fourth;
  }

  let g = spawnAll([example1, example2]);
  let state = g.next();
  assert.ok(!state.done, 'not done');
  resolveFirst();
  return state.value.then(v => {
    state = g.next(v);
    assert.ok(!state.done, 'not done 2');
    resolveSecond();
    return state.value;
  }).then(v => {
    state = g.next(v);
    assert.ok(!state.done, 'not done 3');
    cancelGenerator(g);
    assert.logEquals(['third canceled', 'fourth canceled']);
  });
});

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

test('fairness', function(assert) {
  function * first() {
    yield;
    assert.log(1);
    yield;
    assert.log(2);
    yield;
    assert.log(3);
  }
  function * second() {
    yield;
    assert.log(4);
    yield;
    assert.log(5);
    yield;
    assert.log(6);
  }
  let g = spawnAll([first, second]);
  let state = g.next();
  let steps = 0;

  function step() {
    if (steps++ > 6) {
      throw new Error("exceeded expected step limit");
    }
    return state.value.then(v => {
      state = g.next(v);
      if (!state.done) {
        return step();
      }
    });
  }

  return step().then(() => {
    assert.logEquals([1, 4, 2, 5, 3, 6]);
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
