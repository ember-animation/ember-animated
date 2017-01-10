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
  ComputedProperty.call(this, function() {
    return new Task(this, taskFn, tp);
  });
  this._bufferPolicy = null;
}

TaskProperty.prototype = Object.create(ComputedProperty.prototype);
Object.assign(TaskProperty.prototype, {
  constructor: TaskProperty,
  restartable() {
    this._bufferPolicy = cancelAllButLast;
    return this;
  }
});

let priv = new WeakMap();

class Task {
  constructor(context, implementation, taskProperty) {
    priv.set(this, {
      context,
      implementation,
      instances: [],
      taskProperty
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
    let instance = spawn(function * () {
      try {
        self._addInstance(current());
        if (policy) {
          let maybeWait = policy(self, privSelf);
          if (maybeWait) {
            yield maybeWait;
          }
        }
        yield * implementation.call(context, ...args)
      } finally {
        self._removeInstance(current());
      }
    });
    return instance;
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
    set(this, 'isRunning', this.concurrency < 1);
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
    object[cleanupMethodName]();
  });
}

function cancelAllButLast(task, privTask) {
  let instances = privTask.instances;
  for (let i = 0; i < instances.length - 1; i++) {
    stop(instances[i]);
  }
}
