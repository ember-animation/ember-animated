import { scheduleOnce, join } from '@ember/runloop';
import { addObserver } from '@ember/object/observers';
import { set, computed } from '@ember/object';
import Ember from 'ember';
import { DEBUG } from '@glimmer/env';
import { spawn, logErrors, current, stop } from './scheduler.js';
import { microwait } from './concurrency-helpers.js';
import { getOrCreate as getOrCreate$1 } from './singleton.js';

function getOrCreate(key, construct) {
  return getOrCreate$1(`ember-scheduler.${key}`, construct);
}
function task(taskFn) {
  let tp = _computed(function (propertyName) {
    return new Task(this, taskFn, tp, propertyName);
  });
  Object.setPrototypeOf(tp, TaskProperty.prototype);
  return tp;
}
function _computed(fn) {
  let cp = function (proto, key) {
    if (cp.setup !== undefined) {
      cp.setup(proto, key);
    }
    // eslint-disable-next-line prefer-rest-params
    return computed(fn)(...arguments);
  };
  Ember._setClassicDecorator(cp);
  return cp;
}
let handlerCounter = 0;
let BaseTaskProperty;
BaseTaskProperty = class {};
class TaskProperty extends BaseTaskProperty {
  _bufferPolicy;
  _observes;
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: depending on the ember version we may or may not have a super
    // method.
    if (super.setup) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      super.setup(...arguments); // eslint-disable-line prefer-rest-params
    }
    if (this._observes) {
      let handlerName = `_ember_animated_handler_${handlerCounter++}`;
      proto[handlerName] = function () {
        let task = this[taskName];
        scheduleOnce('actions', task, '_safePerform');
      };
      for (let i = 0; i < this._observes.length; ++i) {
        let name = this._observes[i];
        addObserver(proto, name, null, handlerName);
      }
    }
  }
}
let priv = getOrCreate('priv', () => new WeakMap());
function getPriv(task) {
  return priv.get(task);
}
class Task {
  concurrency = 0;
  isRunning = false;
  constructor(context, implementation, taskProperty, name) {
    priv.set(this, {
      context,
      implementation,
      instances: [],
      taskProperty,
      name
    });
  }
  perform(...args) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let self = this;
    let privSelf = getPriv(this);
    let context = privSelf.context;
    let implementation = privSelf.implementation;
    let policy = privSelf.taskProperty._bufferPolicy;
    if (context.isDestroyed) {
      throw new Error(`Tried to perform task ${privSelf.name} on an already destroyed object`);
    }
    cleanupOnDestroy(context, this);
    return spawn(function* () {
      if (DEBUG) {
        logErrors(error => {
          microwait().then(() => {
            throw error;
          });
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
        let finalValue = yield* withRunLoop(implementation.call(context, ...args));
        return finalValue;
      } finally {
        join(() => {
          self._removeInstance(current());
        });
      }
    });
  }
  cancelAll() {
    getPriv(this).instances.forEach(i => stop(i));
  }
  _addInstance(i) {
    getPriv(this).instances.push(i);
    set(this, 'isRunning', true);
    set(this, 'concurrency', this.concurrency + 1);
  }
  _removeInstance(i) {
    let instances = getPriv(this).instances;
    instances.splice(instances.indexOf(i), 1);
    set(this, 'concurrency', this.concurrency - 1);
    set(this, 'isRunning', this.concurrency > 0);
  }
  _safePerform() {
    let {
      context
    } = getPriv(this);
    if (!context.isDestroyed) {
      this.perform();
    }
  }
}

// cribbed from machty's ember-concurrency
function cleanupOnDestroy(owner, object) {
  if (!owner.willDestroy) {
    // we're running in non Ember object (possibly in a test mock)
    return;
  }
  if (!owner.willDestroy.__ember_processes_destroyers__) {
    let oldWillDestroy = owner.willDestroy;
    let disposers = [];
    owner.willDestroy = function () {
      for (const disposer of disposers) {
        disposer();
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      oldWillDestroy.apply(owner, arguments); // eslint-disable-line prefer-rest-params
    };
    owner.willDestroy.__ember_processes_destroyers__ = disposers;
  }
  owner.willDestroy.__ember_processes_destroyers__.push(() => {
    try {
      object.cancelAll();
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (err.message !== 'TaskCancelation') {
        throw err;
      }
    }
  });
}
function cancelAllButLast(_task, privTask) {
  const instances = privTask.instances;
  for (const instance of instances.slice(0, -1)) {
    stop(instance);
  }
}
function drop(_task, privTask) {
  let instances = privTask.instances;
  for (let i = 1; i < instances.length; i++) {
    stop(instances[i]);
  }
}
function* withRunLoop(generator) {
  let state;
  let threw;
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        threw = err;
      }
    });
    if (threw) {
      throw threw;
    }
    if (state.done) {
      return state.value;
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
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { Task, TaskProperty, task, timeout };
//# sourceMappingURL=ember-scheduler.js.map
