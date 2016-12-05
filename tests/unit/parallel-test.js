import { module, test } from 'qunit';
import parallel from 'ember-animated/parallel';
import { Promise } from 'ember-animated/concurrency-helpers';

module("Unit | parallel", {
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

test('starts each generator immediately', function(assert) {
  function * first() {
    assert.log(1);
  }
  function * second() {
    assert.log(2);
  }
  let g = parallel([first(), second()]);
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
    let g = parallel([first(), second()]);
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
  let g = parallel([example()]);
  let state = g.next();
  assert.ok(!state.done, 'not done');
  resolve();
  return state.value.then(v => {
    state = g.next(v);
    assert.ok(state.done, 'done');
  });
});

test('waits for returned promise', function(assert) {
  let resolveFirst, resolveSecond;
  function * example() {
    yield new Promise(r => resolveFirst = r);
    return new Promise(r => resolveSecond = r);
  }
  let g = parallel([example()]);
  let state = g.next();
  assert.ok(!state.done, 'not done');
  resolveFirst();
  return state.value.then(v => {
    state = g.next(v);
    assert.ok(!state.done, 'still not done');
    resolveSecond();
    return state.value;
  }).then(v => {
    state = g.next(v);
    assert.ok(state.done, 'done');
  });
});

test('handles immediate exception', function(assert) {
  let resolve;
  function * first() {
    let b = new Error("boom");
    b.message = 'boom';
    throw b;
  }
  function * second() {
    assert.log(2);
    yield new Promise(r => resolve = r);
    assert.log(3);
  }
  let g = parallel([first(), second()], reason => assert.log(reason.message));
  let state = g.next();
  assert.ok(!state.done, 'not done');
  resolve();
  return state.value.then(v => {
    state = g.next(v);
    assert.ok(state.done, 'done');
    assert.logEquals(['boom', 2, 3]);
  });
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
    let g = parallel([first(), second()], reason => assert.log(reason.message));
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
  let g = parallel([example()]);
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
    return fourth;
  }

  let g = parallel([example1(), example2()]);
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
    state.value.__ec_cancel__();
    assert.logEquals(['third canceled', 'fourth canceled']);
  });
});
