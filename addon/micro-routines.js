import { Promise, microwait } from './concurrency-helpers';
let current;

function withCurrent(routine, fn) {
  let prior = current;
  current = routine;
  try {
    return fn();
  } finally {
    current = prior;
  }
}

export function logErrors(fn) {
  if (!current) {
    throw new Error("You may only call logErrors from within a running microroutine");
  }
  current.scheduler._onError = fn;
}

export function spawn(generator) {
  let g = (function *() {
    let scheduler = new Scheduler();
    let main = scheduler.spawn(generator());
    yield * scheduler.run();
    return main;
  })();
  let promise = _await(g);
  promise.__ec_cancel__ = function() {
    cancelGenerator(g);
  };
  return promise;
}

export function cancel(promise) {
  let func = promise.__ec_cancel__;
  if (typeof func !== 'function') {
    throw new Error("Not a cancelable promise", promise);
  }
  microwait().then(() => {
    func.call(promise);
  });
}

export function currentTask() {
  if (current) {
    return current.promise;
  }
}

function _await(generator, nextMethod='next', nextValue) {
  return new Promise(resolve => {
    // this handles the case where the generator throws and we want
    // our promise to be rejected.
    resolve(generator[nextMethod](nextValue));
  }).then(state => {
    if (state.done) {
      return state.value;
    }
    return Promise.resolve(state.value).then(value => {
      return _await(generator, 'next', value);
    }, err => {
      return _await(generator, 'throw', err);
    });
  });
}

export function fork(generator) {
  if (!current) {
    throw new Error("cannot fork because we're not inside a microroutine");
  }
  return current.scheduler.spawn(generator());
}

export class Scheduler {
  constructor(onError) {
    this._onError = onError
    this._routines = [];
  }
  spawn(generator) {
    let promise, resolve, reject;
    promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    let routine = new MicroRoutine(generator, this, promise, resolve, reject);
    routine.wake({ state: 'fulfilled', value: undefined, index: -1 });
    if (!routine.state.done) {
      this._routines.push(routine);
    }
    return promise;
  }
  * run() {
    try {
      while (this._routines.length > 0) {
        let resolved = yield race(this._routines);
        let { index } = resolved;
        let routine = this._routines[index];
        this._routines.splice(index, 1);
        routine.wake(resolved);
        if (!routine.state.done) {
          this._routines.push(routine);
        }
      }
    } finally {
      this.cancel();
    }
  }
  cancel() {
    let waiting = this._routines;
    for (let i = 0; i < waiting.length; i++) {
      let routine = waiting[i];
      let value = routine.state.value;
      if (isPromise(value) && value.__ec_cancel__) {
        value.__ec_cancel__();
      }
      cancelGenerator(routine.generator);
    }
  }
}


class MicroRoutine {
  constructor(generator, scheduler, promise, resolve, reject) {
    this.generator = generator;
    this.scheduler = scheduler;
    this.state = null;
    this.promise = promise;
    this.resolve = resolve;
    this.reject = reject;
  }
  wake(resolved) {
    try {
      if (resolved.state === 'fulfilled') {
        this.state = withCurrent(this, () => this.generator.next(resolved.value));
      } else {
        this.state = withCurrent(this, () => this.generator.throw(resolved.reason));
      }
      if (this.state.done) {
        this.resolve(this.state.value);
      }
    } catch(err) {
      this.state = {
        done: true
      };
      if (this.scheduler._onError) {
        this.scheduler._onError(err);
      }
      this.reject(err);
    }
  }
}

function race(routines) {
  return new Promise(resolve => {
    for (let index = 0; index < routines.length; index++) {
      let routine = routines[index];
      let value = routine.state.value;
      Promise.resolve(value).then(value => {
        resolve({ state: 'fulfilled', value, index });
      }, reason => {
        resolve({ state: 'rejected', reason, index });
      });
    }
  });
}


export function cancelGenerator(generator) {
  let e = new Error('TaskCancelation');
  e.message = 'TaskCancelation';
  try {
    generator.throw(e);
  } catch(err) {
    if (err.message !== 'TaskCancelation') {
      throw err;
    }
  }
}

function isPromise(thing) {
  return thing && typeof thing.then === 'function';
}
