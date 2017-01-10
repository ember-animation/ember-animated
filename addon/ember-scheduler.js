import {
  spawn,
  current,
  stop
} from './scheduler';
import Ember from 'ember';

export function task(fn) {
  return Ember.computed(function() {
    return new Task(this, fn);
  });
}

class Task {
  constructor(context, implementation) {
    this.context = context;
    this.implementation = implementation;
    this.instances = [];
  }
  get concurrency() {
    return this.instances.length;
  }
  perform(...args) {
    let self = this;
    cleanupOnDestroy(self.context, this, 'cancelAll');
    let instance = spawn(function * () {
      try {
        self.instances.push(current());
        yield * self.implementation.call(self.context, ...args)
      } finally {
        self.instances.splice(self.instances.indexOf(current()), 1);
      }
    });
    return instance;
  }
  cancelAll() {
    this.instances.forEach(i => stop(i));
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
