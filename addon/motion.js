import {
  rAF,
  Promise,
  microwait
} from './concurrency-helpers';

const motions = new WeakMap();
const bridges = new WeakMap();

export default class Motion {

  constructor(sprite, opts) {
    this.sprite = sprite;
    this.opts = opts;

    // You can set this property directly if you want to. If you leave
    // it null the transition will apply its own overall duration,
    // which is often what you want.
    this.duration = null;


    this._setupMotionList();
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject;
    });
  }

  // --- Begin Hooks you should Implement ---

  // Here you can inspect the other motions on this element that have
  // been interrupted during this frame. You should save any state on
  // `this` in order to influence your own animation. This hook is
  // skipped if there were no other motions.
  interrupted(/* motions */) {
  }

  // Implement your animation here. It must be a generator function
  // that yields promises (just like an ember-concurrency task, except
  // you don't need to wrap in `task()` here and you therefore don't
  // get the extra features provided by EC tasks.
  * animate() {
  }


  // --- Begin private methods ---


  // this is private because the public way to run a motion is
  // TransitionContext#animate.
  * _run() {
    try {
      let others = this._motionList.filter(m => m !== this);
      if (this._inheritedMotionList) {
        others = others.concat(this._inheritedMotionList);
      }
      if (others.length > 0) {
        this.interrupted(others);
      }
      yield * this.animate();
    } catch (err) {
      if (err.message !== 'TaskCancelation') {
        this._reject(err);
      }
      throw err;
    } finally {
      this._resolve();
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
    let bridge = bridges.get(element);
    if (bridge) {
      let inheritedMotions = motions.get(bridge);
      if (inheritedMotions) {
        this._inheritedMotionList = inheritedMotions;
      }
    }
  }

  _clearMotionList() {
    let index = this._motionList.indexOf(this);
    this._motionList.splice(index, 1);
    if (this._motionList.length === 0) {
      motions.delete(this.sprite.element);
    }
    this._motionList = null;
  }

}

export function continueMotions(oldElement, newElement) {
  bridges.set(newElement, oldElement);
  rAF().then(() => {
    if (bridges.get(newElement) === oldElement) {
      bridges.delete(newElement);
    }
  });
}
