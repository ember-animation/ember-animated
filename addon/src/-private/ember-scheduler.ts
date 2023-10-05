import { join, scheduleOnce } from '@ember/runloop';
import { addObserver } from '@ember/object/observers';
import { computed, set } from '@ember/object';
import { spawn, current, stop, logErrors } from './scheduler';
import Ember from 'ember';
import { microwait } from './concurrency-helpers';
import { DEBUG } from '@glimmer/env';
import { getOrCreate as _getOrCreate } from './singleton';

function getOrCreate<T>(key: string, construct: () => T): T {
  return _getOrCreate(`ember-scheduler.${key}`, construct);
}

type HostObject = Record<string, any>;

export function task(taskFn: (...args: any[]) => Generator) {
  let tp = _computed(function (this: HostObject, propertyName: string) {
    return new Task(this, taskFn, tp, propertyName);
  }) as unknown as TaskProperty;

  Object.setPrototypeOf(tp, TaskProperty.prototype);
  return tp as ((proto: any, key: string) => any) & TaskProperty;
}

function _computed(fn: (this: HostObject, propertyName: string) => Task) {
  let cp = function (proto: HostObject, key: string) {
    if ((cp as any).setup !== undefined) {
      (cp as any).setup(proto, key);
    }
    return (computed(fn) as any)(...arguments);
  };
  (Ember as any)._setClassicDecorator(cp);
  return cp;
}

let handlerCounter = 0;

let BaseTaskProperty: { new (): HostObject };

BaseTaskProperty = class {};

type BufferPolicy = (task: Task, priv: TaskPrivate) => Promise<void> | void;

export class TaskProperty extends BaseTaskProperty {
  _bufferPolicy: BufferPolicy | undefined;
  private _observes: string[] | undefined;

  restartable() {
    this._bufferPolicy = cancelAllButLast;
    return this;
  }

  drop() {
    this._bufferPolicy = drop;
    return this;
  }

  observes(...deps: string[]) {
    this._observes = deps;
    return this;
  }

  setup(proto: HostObject, taskName: string) {
    // @ts-ignore: depending on the ember version we may or may not have a super
    // method.
    if (super.setup) {
      // @ts-ignore
      super.setup(...arguments);
    }
    if (this._observes) {
      let handlerName = `_ember_animated_handler_${handlerCounter++}`;
      (proto as any)[handlerName] = function () {
        let task = this[taskName];
        scheduleOnce('actions', task, '_safePerform');
      };
      for (let i = 0; i < this._observes.length; ++i) {
        let name = this._observes[i];
        (addObserver as any)(proto, name, null, handlerName);
      }
    }
  }
}

interface TaskPrivate {
  context: HostObject;
  implementation: (...args: unknown[]) => Generator;
  instances: Promise<void>[];
  taskProperty: TaskProperty;
  name: string;
}

let priv = getOrCreate<WeakMap<Task, TaskPrivate>>('priv', () => new WeakMap());

function getPriv(task: Task): TaskPrivate {
  return priv.get(task)!;
}

export class Task {
  concurrency = 0;
  isRunning = false;

  constructor(
    context: any,
    implementation: TaskPrivate['implementation'],
    taskProperty: TaskProperty,
    name: string,
  ) {
    priv.set(this, {
      context,
      implementation,
      instances: [],
      taskProperty,
      name,
    });
  }
  perform(...args: unknown[]) {
    let self = this;
    let privSelf = getPriv(this);
    let context = privSelf.context;
    let implementation = privSelf.implementation;
    let policy = privSelf.taskProperty._bufferPolicy;
    if ((context as any).isDestroyed) {
      throw new Error(
        `Tried to perform task ${privSelf.name} on an already destroyed object`,
      );
    }
    cleanupOnDestroy(context, this);
    return spawn(function* () {
      if (DEBUG) {
        logErrors((error) => {
          microwait().then(() => {
            throw error;
          });
        });
      }

      try {
        self._addInstance(current()!);
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
          self._removeInstance(current()!);
        });
      }
    });
  }
  cancelAll() {
    getPriv(this).instances.forEach((i) => stop(i));
  }
  _addInstance(i: Promise<void>) {
    getPriv(this).instances.push(i);
    set(this, 'isRunning', true);
    set(this, 'concurrency', this.concurrency + 1);
  }
  _removeInstance(i: Promise<void>) {
    let instances = getPriv(this).instances;
    instances.splice(instances.indexOf(i), 1);
    set(this, 'concurrency', this.concurrency - 1);
    set(this, 'isRunning', this.concurrency > 0);
  }
  _safePerform() {
    let { context } = getPriv(this);
    if (!(context as any).isDestroyed) {
      this.perform();
    }
  }
}

// cribbed from machty's ember-concurrency
function cleanupOnDestroy(
  owner: {
    willDestroy?: ((...args: any[]) => void) & {
      __ember_processes_destroyers__?: (() => void)[];
    };
  },
  object: { cancelAll(): void },
) {
  if (!owner.willDestroy) {
    // we're running in non Ember object (possibly in a test mock)
    return;
  }

  if (!owner.willDestroy.__ember_processes_destroyers__) {
    let oldWillDestroy = owner.willDestroy;
    let disposers: (() => void)[] = [];

    owner.willDestroy = function () {
      for (const disposer of disposers) {
        disposer();
      }
      // @ts-ignore
      oldWillDestroy.apply(owner, arguments);
    };
    owner.willDestroy.__ember_processes_destroyers__ = disposers;
  }

  owner.willDestroy.__ember_processes_destroyers__.push(() => {
    try {
      object.cancelAll();
    } catch (err) {
      // @ts-ignore
      if (err.message !== 'TaskCancelation') {
        throw err;
      }
    }
  });
}

function cancelAllButLast(_task: Task, privTask: TaskPrivate) {
  const instances = privTask.instances;
  for (const instance of instances.slice(0, -1)) {
    stop(instance);
  }
}

function drop(_task: Task, privTask: TaskPrivate) {
  let instances = privTask.instances;
  for (let i = 1; i < instances.length; i++) {
    stop(instances[i]!);
  }
}

function* withRunLoop(generator: Generator): Generator {
  let state!: IteratorResult<any>;
  let threw: Error | undefined;
  let nextValue: any;
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

export function timeout(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
