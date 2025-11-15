import { registerCancellation, fireCancellation } from './concurrency-helpers.js';
import { getOrCreate as getOrCreate$1 } from './singleton.js';

/*

API
===

  spawn: GenFn -> CancelablePromise

    starts a new microroutine, which will run independently until it
    finishes or is canceled.

  spawnChild: GenFn -> CancelablePromise

    starts a new microroutine linked to the current
    microroutine. Throws if you're not in a current
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

function getOrCreate(key, construct) {
  return getOrCreate$1(`scheduler.${key}`, construct);
}

// TODO: specialize the Generator types here so you can only yield promises and
// get back the promise's resolved type.
function spawn(genFn) {
  let m = new MicroRoutine(genFn, false);
  return m.promise;
}
function spawnChild(genFn) {
  let m = new MicroRoutine(genFn, true);
  return m.promise;
}
function stop(microRoutinePromise) {
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
function logErrors(fn) {
  ensureCurrent('logErrors').errorLogger = fn;
}
function current() {
  let cur = getCurrent();
  if (cur) {
    return cur.promise;
  }
  return;
}
async function childrenSettled() {
  return Promise.all(ensureCurrent('childrenSettled').linked.map(child => child.promise.catch(() => null)));
}
function isTaskCancelationError(x) {
  return x.message === 'TaskCancelation';
}
let withCurrent;
let getCurrent;
let onStack;
{
  const routines = getOrCreate('routines', () => ({
    cur: undefined,
    prior: []
  }));

  // let cur: MicroRoutine | undefined;
  // let prior: StackEntry[] = [];
  withCurrent = function (routine, fn) {
    routines.prior.unshift({
      microroutine: routines.cur,
      throw: undefined
    });
    routines.cur = routine;
    try {
      return fn();
    } finally {
      let restore = routines.prior.shift();
      routines.cur = restore.microroutine;
      if (restore.throw) {
        /*
           Why is this not really "unsafe"? Because if the
           microroutine that we are restoring has been cancelled, the
           cancellation takes precedence over any exception that it
           was going to see, so it's OK that this throw will silently
           stomp a throw coming out of the above block.
        */
        throw restore.throw; // eslint-disable-line no-unsafe-finally
      }
    }
  };
  getCurrent = function () {
    return routines.cur;
  };
  onStack = function (microroutine) {
    return routines.prior.find(entry => entry.microroutine === microroutine);
  };
}
function ensureCurrent(label) {
  let cur = getCurrent();
  if (!cur) {
    throw new Error(`${label}: only works inside a running microroutine`);
  }
  return cur;
}
let loggedErrors = getOrCreate('loggedErrors', () => new WeakSet());
let microRoutines = getOrCreate('microRoutines', () => new WeakMap());
class MicroRoutine {
  generator;
  resolve;
  reject;
  stopped = false;
  state;
  linked = [];
  errorLogger;
  promise;
  constructor(genFn, linkToParent) {
    this.generator = genFn();
    this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
    microRoutines.set(this.promise, this);
    registerCancellation(this.promise, this.stop.bind(this));
    if (linkToParent) {
      let parent = ensureCurrent('spawnChild');
      parent.linked.push(this);
      this.errorLogger = parent.errorLogger;
    }
    this.wake('fulfilled', undefined);
  }
  wake(state, value) {
    if (this.stopped) {
      return;
    }
    withCurrent(this, () => {
      try {
        if (state === 'fulfilled') {
          this.state = this.generator.next(value);
        } else {
          // All native generators have a throw, Typescript doesn't seem to know
          // that because it defines Generator as just an Iterator.
          this.state = this.generator.throw(value);
        }
        if (this.state.done) {
          this.resolve(this.state.value);
        } else {
          Promise.resolve(this.state.value).then(value => this.wake('fulfilled', value), reason => this.wake('rejected', reason));
        }
      } catch (err) {
        this.state = {
          done: true,
          value: undefined
        };
        this.linked.forEach(microRoutine => {
          microRoutine.stop();
        });
        if (!isTaskCancelationError(err)) {
          this.reject(err);
          if (this.errorLogger) {
            if (!loggedErrors.has(err)) {
              loggedErrors.add(err);
              this.errorLogger.call(null, err);
            }
          }
        }
      }
    });
  }
  stop() {
    this.stopped = true;
    if (this.state && isPromise(this.state.value)) {
      fireCancellation(this.state.value);
    }
    this.linked.forEach(microRoutine => {
      microRoutine.stop();
    });
    let e = new Error('TaskCancelation');
    e.message = 'TaskCancelation';
    if (getCurrent() === this) {
      // when a microroutine calls stop() resulting it stopping
      // itself, the stop call throws TaskCancellation to unwind its
      // own stack.
      throw e;
    }
    let s = onStack(this);
    if (s) {
      // because of the synchronous nature of spawn() and stop(), it's
      // possible that the microroutine we're stopping is already on
      // the current call stack above us. If we tried to
      // cancelGenerator it would give a "generator already running"
      // exception. Instead we save the exception to throw when
      // control returns back to the stopped microroutine.
      s.throw = e;
    } else {
      // the stopped microroutine is not on our call stack, so we can
      // throw an exception into it to unwind the generator's stack.
      withCurrent(this, () => cancelGenerator(this.generator));
    }
  }
}
function cancelGenerator(generator) {
  let e = new Error('TaskCancelation');
  e.message = 'TaskCancelation';
  try {
    generator.throw(e);
  } catch (err) {
    if (!isTaskCancelationError(err)) {
      throw err;
    }
  }
}
function isPromise(thing) {
  return thing && typeof thing.then === 'function';
}

// composes several promise-returning functions into a single
// promise-returning function that executes all in parallel.
//
// This allows point-free style, like:
//   sprites.forEach(parallel(move, scale)).
//
function parallel(...functions) {
  return function (...args) {
    // eslint-disable-next-line prefer-spread
    return Promise.all(functions.map(f => f.apply(null, args)));
  };
}

// composes several promise-returning functions into a single
// promise-returning function that executes all in series.
//
// This allows point-free style, like:
//   sprites.forEach(serial(scale, move)).
//
function serial(...functions) {
  return function (...args) {
    return spawnChild(function* () {
      for (let fn of functions) {
        // eslint-disable-next-line prefer-spread
        yield fn.apply(null, args);
      }
    });
  };
}

export { childrenSettled, current, logErrors, parallel, serial, spawn, spawnChild, stop };
//# sourceMappingURL=scheduler.js.map
