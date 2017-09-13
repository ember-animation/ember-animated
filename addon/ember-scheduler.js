import {
  spawn,
  current,
  stop
} from './scheduler';
import Ember from 'ember';
const {
  set,
  ComputedProperty
} = Ember;

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
Object.assign(TaskProperty.prototype, {
  constructor: TaskProperty,
  restartable() {
    this._bufferPolicy = cancelAllButLast;
    return this;
  },
  observes(...deps) {
    this._observes = deps;
    return this;
  },
  setup(proto, taskName) {
    registerOnPrototype(Ember.addObserver, proto, this._observes, taskName, 'perform', true);
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
    cleanupOnDestroy(context, this, 'cancelAll');
    return spawn(function * () {
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
        Ember.run.join(() => {
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
  return function() {
    let task = this.get(taskName);

    if (once) {
      Ember.run.scheduleOnce('actions', task, method, ...arguments);
    } else {
      task[method].apply(task, arguments);
    }
  };
}

function cancelAllButLast(task, privTask) {
  let instances = privTask.instances;
  for (let i = 0; i < instances.length - 1; i++) {
    stop(instances[i]);
  }
}

function * withRunLoop(generator) {
  let state;
  let nextValue;
  let fulfilled = true;
  while (true) {
    Ember.run.join(() => {
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
  return new Ember.RSVP.Promise(resolve => setTimeout(resolve, ms));
}
