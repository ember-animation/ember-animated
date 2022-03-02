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

import { registerCancellation, fireCancellation } from './concurrency-helpers';

// TODO: specialize the Generator types here so you can only yield promises and
// get back the promise's resolved type.
export function spawn(genFn: () => Generator) {
  let m = new MicroRoutine(genFn, false);
  return m.promise;
}

export function spawnChild(genFn: () => Generator) {
  let m = new MicroRoutine(genFn, true);
  return m.promise;
}

export function stop(microRoutinePromise: Promise<any>) {
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

export function logErrors(fn: (err: Error) => void) {
  ensureCurrent('logErrors').errorLogger = fn;
}

export function current() {
  let cur = getCurrent();
  if (cur) {
    return cur.promise;
  }
  return;
}

export async function childrenSettled() {
  return Promise.all(
    ensureCurrent('childrenSettled').linked.map((child) =>
      child.promise.catch(() => null),
    ),
  );
}

interface TaskCancelationError extends Error {
  message: string;
}

function isTaskCancelationError(x: unknown) {
  return (x as TaskCancelationError).message === 'TaskCancelation';
}

interface StackEntry {
  microroutine: MicroRoutine | undefined;
  throw: Error | undefined;
}
let withCurrent: (routine: MicroRoutine, fn: () => void) => void;
let getCurrent: () => MicroRoutine | undefined;
let onStack: (routine: MicroRoutine) => StackEntry | undefined;
{
  let cur: MicroRoutine | undefined;
  let prior: StackEntry[] = [];
  withCurrent = function (routine, fn) {
    prior.unshift({ microroutine: cur, throw: undefined });
    cur = routine;
    try {
      return fn();
    } finally {
      let restore = prior.shift()!;
      cur = restore.microroutine;
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
    return cur;
  };
  onStack = function (microroutine) {
    return prior.find((entry) => entry.microroutine === microroutine);
  };
}

function ensureCurrent(label: string) {
  let cur = getCurrent();
  if (!cur) {
    throw new Error(`${label}: only works inside a running microroutine`);
  }
  return cur;
}

let loggedErrors: WeakSet<Error> = new WeakSet();
let microRoutines: WeakMap<Promise<any>, MicroRoutine> = new WeakMap();

class MicroRoutine {
  private generator: Generator;
  private resolve!: (value?: any) => void;
  private reject!: (reason?: any) => void;
  private stopped = false;
  private state!: IteratorResult<any>;

  linked: MicroRoutine[] = [];
  errorLogger: ((e: Error) => void) | undefined;
  promise: Promise<any>;

  constructor(genFn: () => Generator, linkToParent: boolean) {
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
  wake(state: 'fulfilled' | 'rejected', value: any) {
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
          this.state = this.generator.throw!(value);
        }
        if (this.state.done) {
          this.resolve(this.state.value);
        } else {
          Promise.resolve(this.state.value).then(
            (value) => this.wake('fulfilled', value),
            (reason) => this.wake('rejected', reason),
          );
        }
      } catch (err) {
        this.state = {
          done: true,
          value: undefined,
        };
        this.linked.forEach((microRoutine) => {
          microRoutine.stop();
        });
        if (!isTaskCancelationError(err)) {
          this.reject(err);
          if (this.errorLogger) {
            if (!loggedErrors.has(err as TaskCancelationError)) {
              loggedErrors.add(err as TaskCancelationError);
              this.errorLogger.call(null, err as TaskCancelationError);
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
    this.linked.forEach((microRoutine) => {
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

function cancelGenerator(generator: Generator) {
  let e = new Error('TaskCancelation');
  e.message = 'TaskCancelation';
  try {
    generator.throw!(e);
  } catch (err) {
    if (!isTaskCancelationError(err)) {
      throw err;
    }
  }
}

function isPromise(thing: any): thing is Promise<any> {
  return thing && typeof thing.then === 'function';
}

// composes several promise-returning functions into a single
// promise-returning function that executes all in parallel.
//
// This allows point-free style, like:
//   sprites.forEach(parallel(move, scale)).
//
export function parallel(...functions: ((...args: any[]) => unknown)[]) {
  return function (...args: any[]) {
    return Promise.all(functions.map((f) => f.apply(null, args)));
  };
}

// composes several promise-returning functions into a single
// promise-returning function that executes all in series.
//
// This allows point-free style, like:
//   sprites.forEach(serial(scale, move)).
//
export function serial(...functions: ((...args: any[]) => unknown)[]) {
  return function (...args: any[]) {
    return spawnChild(function* () {
      for (let fn of functions) {
        yield fn.apply(null, args);
      }
    });
  };
}
