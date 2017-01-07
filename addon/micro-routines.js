import { Promise } from './concurrency-helpers';
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
  return _await((function *() {
    let scheduler = new Scheduler();
    let main = scheduler.spawn(generator());
    yield * scheduler.run();
    return main;
  })());
}

function _await(generator, nextMethod='next', nextValue) {
  return new Promise(resolve => {
    // this handles the case where the generator throws and we want
    // our promises to be rejected.
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
    return new Promise((resolve, reject) => {
      let routine = new MicroRoutine(generator, this, resolve, reject);
      routine.wake({ state: 'fulfilled', value: undefined, index: -1 });
      if (!routine.state.done) {
        this._routines.push(routine);
      }
    });
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
      cancel(this._routines);
    }
  }
}


class MicroRoutine {
  constructor(generator, scheduler, resolve, reject) {
    this.generator = generator;
    this.scheduler = scheduler;
    this.state = null;
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

function cancel(waiting) {
  for (let i = 0; i < waiting.length; i++) {
    let routine = waiting[i];
    let value = routine.state.value;
    if (isPromise(value) && value.__ec_cancel__) {
      value.__ec_cancel__();
    }
    cancelGenerator(routine.generator);
  }
}

function isPromise(thing) {
  return thing && typeof thing.then === 'function';
}
