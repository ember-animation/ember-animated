import { spawnChild } from './scheduler.js';
import { rAF, microwait } from './concurrency-helpers.js';
import { continuedFromElement } from './motion-bridge.js';
import TransitionContext from './transition-context.js';
import { getOrCreate } from './singleton.js';

const motions = getOrCreate('motion', () => new WeakMap());
class Motion {
  _motionList;
  _inheritedMotionList;
  constructor(sprite, opts = {}) {
    this.sprite = sprite;
    this.opts = opts;
    this.sprite = sprite;
    this.opts = opts;
    this._setupMotionList();
  }

  // All motions should read this to decide how long to animate. It allows users
  // to set a duration explicitly or rely on the prevailing default for the
  // whole running transition.
  get duration() {
    if (this.opts.duration != null) {
      return this.opts.duration;
    }
    return TransitionContext.forSprite(this.sprite).duration;
  }
  run() {
    let context = TransitionContext.forSprite(this.sprite);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let self = this;
    return spawnChild(function* () {
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interrupted(_otherMotions) {}

  // Implement your animation here. It must be a generator function
  // that yields promises (just like an ember-concurrency task, except
  // you don't need to wrap in `task()` here and you therefore don't
  // get the extra features provided by EC tasks.
  *animate() {}

  // --- Begin private methods ---

  *_run() {
    try {
      let others = this._motionList.filter(m => m !== this);
      if (this._inheritedMotionList) {
        others = others.concat(this._inheritedMotionList);
      }
      if (others.length > 0) {
        this.interrupted(others);
      }
      yield* this.animate();
    } finally {
      rAF().then(() => this._clearMotionList());
    }
  }
  _setupMotionList() {
    let element = this.sprite.element;
    let motionList = motions.get(element);
    if (!motionList) {
      motions.set(element, motionList = []);
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

export { Motion as default };
//# sourceMappingURL=motion.js.map
