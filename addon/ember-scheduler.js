import {
  spawn,
  current,
  stop
} from './scheduler';
import Ember from 'ember';
const { set } = Ember;

export function task(fn) {
  return Ember.computed(function() {
    return new Task(this, fn);
  });
}

let priv = new WeakMap();

class Task {
  constructor(context, implementation) {
    priv.set(this, {
      context,
      implementation,
      instances: []
    });
    this.concurrency = 0;
    this.isRunning = false;
  }
  perform(...args) {
    let self = this;
    let context = priv.get(this).context;
    let implementation = priv.get(this).implementation;
    cleanupOnDestroy(context, this, 'cancelAll');
    let instance = spawn(function * () {
      try {
        self._addInstance(current());
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
