import { spawnChild } from './scheduler';
import { rAF, microwait } from './concurrency-helpers';
import { continuedFromElement } from './motion-bridge';
import TransitionContext from './transition-context';
import Sprite from './sprite';

const motions: WeakMap<Element, Motion[]> = new WeakMap();

interface BaseOptions {
  duration: number;
}

export default abstract class Motion<T extends BaseOptions = BaseOptions> {
  private _motionList: Motion[] | undefined;
  private _inheritedMotionList: Motion[] | undefined;

  private _promise: Promise<unknown>;
  private _resolve!: () => void;
  private _reject!: (err: any) => void;

  constructor(readonly sprite: Sprite, readonly opts: Partial<T> = {}) {
    this.sprite = sprite;
    this.opts = opts;
    this._setupMotionList();
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  // All motions should read this to decide how long to animate. It allows users
  // to set a duration explicitly or rely on the prevailing default for the
  // whole running transition.
  get duration(): number {
    if (this.opts.duration != null) {
      return this.opts.duration;
    }
    return TransitionContext.forSprite(this.sprite).duration;
  }

  run() {
    let context = TransitionContext.forSprite(this.sprite);
    let self = this;
    return spawnChild(function*() {
      context.onMotionStart(self.sprite);
      try {
        yield* self._run();
      } finally {
        context.onMotionEnd(self.sprite);
      }
    });
  }

  // --- Begin Hooks you should Implement ---

  // Here you can inspect the other motions on this element that have
  // been interrupted during this frame. You should save any state on
  // `this` in order to influence your own animation. This hook is
  // skipped if there were no other motions.
  interrupted(_otherMotions: Motion[]): void {}

  // Implement your animation here. It must be a generator function
  // that yields promises (just like an ember-concurrency task, except
  // you don't need to wrap in `task()` here and you therefore don't
  // get the extra features provided by EC tasks.
  *animate() {}

  // --- Begin private methods ---

  *_run() {
    try {
      let others = this._motionList!.filter(m => m !== this);
      if (this._inheritedMotionList) {
        others = others.concat(this._inheritedMotionList);
      }
      if (others.length > 0) {
        this.interrupted(others);
      }
      yield* this.animate();
      this._resolve();
    } catch (err) {
      if (err.message !== 'TaskCancelation') {
        this._reject(err);
      }
      throw err;
    } finally {
      rAF().then(() => this._clearMotionList());
    }
  }

  _setupMotionList() {
    let element = this.sprite.element;
    let motionList = motions.get(element);
    if (!motionList) {
      motions.set(element, (motionList = []));
    }
    this._motionList = motionList;
    // we wait here so that if multiple motions are started
    // simultaneously, the latter ones don't see the earlier ones as
    // interrupted.
    microwait().then(() => {
      if (this._motionList) {
        this._motionList.unshift(this);
      }
    });
    let oldElement = continuedFromElement(element);
    if (oldElement) {
      let inheritedMotions = motions.get(oldElement);
      if (inheritedMotions) {
        this._inheritedMotionList = inheritedMotions;
      }
    }
  }

  _clearMotionList() {
    if (this._motionList) {
      let index = this._motionList.indexOf(this);
      this._motionList.splice(index, 1);
      if (this._motionList.length === 0) {
        motions.delete(this.sprite.element);
      }
      this._motionList = undefined;
    }
  }
}
