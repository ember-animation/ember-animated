import { Promise as EmberPromise } from 'rsvp';
import { join, scheduleOnce } from '@ember/runloop';
import { addObserver } from '@ember/object/observers';
import { computed, set } from '@ember/object';
import ComputedProperty from '@ember/object/computed';
import { gte } from 'ember-compatibility-helpers';
import { spawn, current, stop, logErrors } from './scheduler';
import Ember from 'ember';
import { microwait } from '..';
import { DEBUG } from '@glimmer/env';

export function task(taskFn) {
  let tp = _computed(function(propertyName) {
    return new Task(this, taskFn, tp, propertyName);
  });

  Object.setPrototypeOf(tp, TaskProperty.prototype);
  return tp;
}

function _computed(fn) {
  if (!gte('3.10.0')) {
    return computed(fn);
  }
  let cp = function(proto, key) {
    if (cp.setup !== undefined) {
      cp.setup(proto, key);
    }
    return computed(fn)(...arguments);
  };
  Ember._setClassicDecorator(cp);
  return cp;
}

let handlerCounter = 0;

let BaseTaskProperty;

if (gte('3.10.0')) {
  BaseTaskProperty = class {
    callSuperSetup() {}
  };
} else {
  BaseTaskProperty = class extends ComputedProperty {
    callSuperSetup() {
      if (super.setup) {
        super.setup(...arguments);
      }
    }
  };
}

export class TaskProperty extends BaseTaskProperty {
  restartable() {
    this._bufferPolicy = cancelAllButLast;
    return this;
  }

  drop() {
    this._bufferPolicy = drop;
    return this;
  }

  observes(...deps) {
    this._observes = deps;
    return this;
  }

  setup(proto, taskName) {
    this.callSuperSetup(...arguments);
    if (this._observes) {
      for (let i = 0; i < this._observes.length; ++i) {
        let name = this._observes[i];
        let handlerName = `_ember_animated_handler_${handlerCounter++}`;
        proto[handlerName] = function(...args) {
          let task = this.get(taskName);
          scheduleOnce('actions', task, '_safePerform', args);
        };
        addObserver(proto, name, null, handlerName);
      }
    }
  }
}

let priv = new WeakMap();

class Task {
  constructor(context, implementation, taskProperty, name) {
    priv.set(this, {
      context,
      implementation,
      instances: [],
      taskProperty,
      name,
    });
    this.concurrency = 0;
    this.isRunning = false;
  }
  perform(...args) {
    let self = this;
    let privSelf = priv.get(this);
    let context = privSelf.context;
    let implementation = privSelf.implementation;
    let policy = privSelf.taskProperty._bufferPolicy;
    if (context.isDestroyed) {
      throw new Error(
        `Tried to perform task ${privSelf.name} on an already destroyed object`,
      );
    }
    cleanupOnDestroy(context, this, 'cancelAll');
    return spawn(function*() {
      if (DEBUG) {
        logErrors(error => {
          if (Ember.testing) {
            Ember.Test.adapter.exception(error);
          } else {
            microwait().then(() => {
              throw error;
            });
          }
        });
      }

      try {
        self._addInstance(current());
        if (policy) {
          let maybeWait = policy(self, privSelf);
          if (maybeWait) {
            yield maybeWait;
          }
        }
        let finalValue = yield* withRunLoop(
          implementation.call(context, ...args),
        );
        return finalValue;
      } finally {
        join(() => {
          self._removeInstance(current());
        });
      }
    });
  }
  cancelAll() {
    priv.get(this).instances.forEach(i => stop(i));
  }
  _addInstance(i) {
    priv.get(this).instances.push(i);
    set(this, 'isRunning', true);
    set(this, 'concurrency', this.concurrency + 1);
  }
  _removeInstance(i) {
    let instances = priv.get(this).instances;
    instances.splice(instances.indexOf(i), 1);
    set(this, 'concurrency', this.concurrency - 1);
    set(this, 'isRunning', this.concurrency > 0);
  }
  _safePerform(args) {
    let { context } = priv.get(this);
    if (!context.isDestroyed) {
      this.perform(...args);
    }
  }
}

// cribbed from machty's ember-concurrency
function cleanupOnDestroy(owner, object, cleanupMethodName) {
  if (!owner.willDestroy) {
    // we're running in non Ember object (possibly in a test mock)
    return;
  }

  if (!owner.willDestroy.__ember_processes_destroyers__) {
    let oldWillDestroy = owner.willDestroy;
    let disposers = [];

    owner.willDestroy = function() {
      for (let i = 0, l = disposers.length; i < l; i++) {
        disposers[i]();
      }
      oldWillDestroy.apply(owner, arguments);
    };
    /* eslint-disable-next-line @typescript-eslint/camelcase */
    owner.willDestroy.__ember_processes_destroyers__ = disposers;
  }

  owner.willDestroy.__ember_processes_destroyers__.push(() => {
    try {
      object[cleanupMethodName]();
    } catch (err) {
      if (err.message !== 'TaskCancelation') {
        throw err;
      }
    }
  });
}

function cancelAllButLast(task, privTask) {
  let instances = privTask.instances;
  for (let i = 0; i < instances.length - 1; i++) {
    stop(instances[i]);
  }
}

function drop(task, privTask) {
  let instances = privTask.instances;
  for (let i = 1; i < instances.length; i++) {
    stop(instances[i]);
  }
}

function* withRunLoop(generator) {
  let state;
  let nextValue;
  let fulfilled = true;
  while (true) {
    join(() => {
      try {
        if (fulfilled) {
          state = generator.next(nextValue);
        } else {
          state = generator.throw(nextValue);
        }
      } catch (err) {
        state = {
          threw: err,
        };
      }
    });

    if (state.done) {
      return state.value;
    }

    if (state.threw) {
      throw state.threw;
    }

    try {
      nextValue = yield state.value;
      fulfilled = true;
    } catch (err) {
      nextValue = err;
      fulfilled = false;
    }
  }
}

export function timeout(ms) {
  return new EmberPromise(resolve => setTimeout(resolve, ms));
}
