/*

API
===

  spawn: GenFn -> CancelablePromise

    starts a new microroutine, which will run independently until it
    finishes or is canceled.

  spawnChild: GenFn -> CancelablePromise

    starts a new microroutine linked to the current
    microroutine. Throws if your'e not in a current
    microroutine.

    "Linked" means that if the caller is canceled, the new
    microroutine is also canceled. The inverse is not true: if the new
    microroutine is canceled, the caller is not canceled.

    `cancel(caller)` causes children to be canceled regardless of what
    state caller is in. For example, even if caller has finished, any
    children that haven't already finished will still be canceled.

  stop: CancelablePromise -> null

    cancel the microroutine represented by this promise.

  current: () -> CancelablePromise

    return the promise representing the currently executing
    microroutine, or null if there is none. This exists because
    spawning happens synchronously, meaning it begins running before
    spawn returns, meaning there's no other way to get an early handle
    on yourself.


*/

import { Promise } from './concurrency-helpers';

export function spawn(genFn) {
  let m = new MicroRoutine(genFn, false);
  return m.promise;
}

export function spawnChild(genFn) {
  let m = new MicroRoutine(genFn, true);
  return m.promise;
}

export function stop(microRoutinePromise) {
  if (microRoutinePromise === current()) {
    let e = new Error('TaskCancelation');
    e.message = 'TaskCancelation';
    throw e;
  }
  let microRoutine = microRoutines.get(microRoutinePromise);
  if (microRoutine) {
    microRoutine.stop();
  }
}

export function logErrors(fn) {
  ensureCurrent('logErrors').errorLogger = fn;
}

export function current() {
  let current = getCurrent();
  if (current) {
    return current.promise;
  }
}

export function childrenSettled() {
  return Promise.all(
    ensureCurrent('childrenSettled').linked.map(
      child => child.promise.catch(() => null)
    )
  );
}

let withCurrent, getCurrent;
{
  let current;
  withCurrent = function(routine, fn) {
    let prior = current;
    current = routine;
    try {
      return fn();
    } finally {
      current = prior;
    }
  };
  getCurrent = function() {
    return current;
  };
}

function ensureCurrent(label) {
  let current = getCurrent();
  if (!current) {
    throw new Error(`${label}: only works inside a running microroutine`);
  }
  return current;
}


let loggedErrors = new WeakMap();
let microRoutines = new WeakMap();

class MicroRoutine {
  constructor(genFn, linked) {
    this.linked = [];
    this.generator = genFn();
    this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
    microRoutines.set(this.promise, this);
    this.promise.__ec_cancel__ = this.stop.bind(this);
    if (linked) {
      let parent = ensureCurrent('spawnChild');
      parent.linked.push(this);
      this.errorLogger = parent.errorLogger;
    } else {
      this.errorLogger = null;
    }
    this.wake('fulfilled', undefined);
  }
  wake(state, value) {
    try {
      if (state === 'fulfilled') {
        this.state = withCurrent(this, () => this.generator.next(value));
      } else {
        this.state = withCurrent(this, () => this.generator.throw(value));
      }
      if (this.state.done) {
        this.resolve(this.state.value);
      } else {
        Promise.resolve(this.state.value).then(
          value => this.wake('fulfilled', value),
          reason => this.wake('rejected', reason)
        );
      }
    } catch(err) {
      this.state = {
        done: true
      };
      this.linked.forEach(microRoutine => {
        microRoutine.stop();
      });
      if (err.message !== 'TaskCancelation') {
        this.reject(err);
        if (this.errorLogger) {
          if (!loggedErrors.get(err)) {
            loggedErrors.set(err, true);
            this.errorLogger.call(null, err)
          }
        }
      }
    }
  }
  stop() {
    if (isPromise(this.state.value) && typeof this.state.value.__ec_cancel__ === 'function') {
      this.state.value.__ec_cancel__();
    }
    cancelGenerator(this.generator);
    this.linked.forEach(microRoutine => {
      microRoutine.stop();
    });
  }
}

function cancelGenerator(generator) {
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
