import { Promise } from './concurrency-helpers';

export class Scheduler {
  constructor(onError) {
    this._onError = onError
    this._routines = [];
  }
  spawn(generator) {
    let routine = new MicroRoutine(generator);
    if (routine.state.done) {
      if (isPromise(routine.state.value)) {
        throw new Error("You may not return a Promise from an animation generator. Yield promises instead.");
      }
    } else {
      this._routines.push(routine);
    }
  }
  * run() {
    try {
      while (this._routines.length > 0) {
        let resolved = yield race(this._routines);
        let { index } = resolved;
        let routine = this._routines[index];
        this._routines.splice(index, 1);
        routine.wake(resolved, this._onError);
        if (routine.state.done) {
          if (isPromise(routine.state.value)) {
            if (this._onError) {
              this._onError(new Error("You may not return a Promise from an animation generator. Yield promises instead."));
            }
          }
        } else {
          this._routines.push(routine);
        }
      }
    } finally {
      cancel(this._routines);
    }
  }
}

class MicroRoutine {
  constructor(generator) {
    this.generator = generator;
    this.state = this.generator.next();
  }
  wake(resolved, onError) {
    try {
      if (resolved.state === 'fulfilled') {
        this.state = this.generator.next(resolved.value);
      } else {
        this.state = this.generator.throw(resolved.reason);
      }
    } catch(err) {
      this.state = {
        done: true
      };
      if (onError) {
        onError(err);
      }
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
