import { Promise as EmberPromise } from 'rsvp';
import { join, scheduleOnce } from '@ember/runloop';
import { addObserver } from '@ember/object/observers';
import { assign } from '@ember/polyfills';
import { set } from '@ember/object';
import ComputedProperty from '@ember/object/computed';
import {
  spawn,
  current,
  stop,
  logErrors
} from './scheduler';
import Ember from 'ember';
import  { microwait } from '..';
import { DEBUG } from '@glimmer/env';

export function task(...args) {
  return new TaskProperty(...args);
}

function TaskProperty(taskFn) {
  let tp = this;
  ComputedProperty.call(this, function(name) {
    return new Task(this, taskFn, tp, name);
  });
  this._bufferPolicy = null;
  this._observes = null;
}

TaskProperty.prototype = Object.create(ComputedProperty.prototype);
assign(TaskProperty.prototype, {
  constructor: TaskProperty,
  restartable() {
    this._bufferPolicy = cancelAllButLast;
    return this;
  },
  drop() {
    this._bufferPolicy = drop;
    return this;
  },
  observes(...deps) {
    this._observes = deps;
    return this;
  },
  setup(proto, taskName) {
    registerOnPrototype(addObserver, proto, this._observes, taskName, 'perform', true);
  },

});

let priv = new WeakMap();

class Task {
  constructor(context, implementation, taskProperty, name) {
    priv.set(this, {
      context,
      implementation,
      instances: [],
      taskProperty,
      name
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
      throw new Error(`Tried to perform task ${privSelf.name} on an already destroyed object`);
    }
    cleanupOnDestroy(context, this, 'cancelAll');
    return spawn(function * () {
      if (DEBUG) {
        logErrors(error => {
          if (Ember.testing) {
            Ember.Test.adapter.exception(error);
          } else {
            microwait().then(() => { throw error; });
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
        let finalValue = yield * withRunLoop(implementation.call(context, ...args));
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
  _safeInvokeCallback(method, args) {
    let { context } = priv.get(this);
    if (!context.isDestroyed) {
      this[method].apply(this, args);
    }
  }
}

// cribbed from machty's ember-concurrency
function cleanupOnDestroy(owner, object, cleanupMethodName) {
  if (!owner.willDestroy)
  {
    // we're running in non Ember object (possibly in a test mock)
    return;
  }

  if (!owner.willDestroy.__ember_processes_destroyers__) {
    let oldWillDestroy = owner.willDestroy;
    let disposers = [];

    owner.willDestroy = function() {
      for (let i = 0, l = disposers.length; i < l; i ++) {
        disposers[i]();
      }
      oldWillDestroy.apply(owner, arguments);
    };
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
function registerOnPrototype(addListenerOrObserver, proto, names, taskName, taskMethod, once) {
  if (names) {
    for (let i = 0; i < names.length; ++i) {
      let name = names[i];
      addListenerOrObserver(proto, name, null, makeTaskCallback(taskName, taskMethod, once));
    }
  }
}
function makeTaskCallback(taskName, method, once) {
  return function(...args) {
    let task = this.get(taskName);

    if (once) {
      scheduleOnce('actions', task, '_safeInvokeCallback', method, args);
    } else {
      task._safeInvokeCallback(method, args);
    }
  };
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

function * withRunLoop(generator) {
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
          threw: err
        }
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
    } catch(err) {
      nextValue = err;
      fulfilled = false;
    }
  }
}

export function timeout(ms) {
  return new EmberPromise(resolve => setTimeout(resolve, ms));
}
