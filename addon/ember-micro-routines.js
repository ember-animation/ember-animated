import { spawn } from './micro-routines';
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
    this.concurrency = 0;
    this.instances = [];
  }
  perform(...args) {
    let self = this;
    cleanupOnDestroy(self.context);
    let instance = spawn(function * () {
      try {
        self.concurrency++;
        yield * self.implementation.call(self.context, ...args)
      } finally {
        self.concurrency--;
      }
    });

    return instance;
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
