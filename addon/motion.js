import { rAF } from './concurrency-helpers';

const motions = new WeakMap();
const bridges = new WeakMap();

export default class Motion {

  constructor(sprite, opts={}) {
    this.sprite = sprite;
    this.opts = opts;
    this._setupMotionList();
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


  // --- Begin public methods you may call ---

  * run() {
    try {
      let others = this._motionList.filter(m => m !== this);
      if (this._inheritedMotionList) {
        others = others.concat(this._inheritedMotionList);
      }
      if (others.length > 0) {
        this.interrupted(others);
      }
      yield * this.animate();
    } finally {
      rAF().then(() => this._clearMotionList());
    }
  }

  // --- Begin private methods ---

  _setupMotionList() {
    let element = this.sprite.element;
    let motionList = motions.get(element);
    if (!motionList) {
      motions.set(element, motionList = []);
    }
    motionList.unshift(this);
    this._motionList = motionList;
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
