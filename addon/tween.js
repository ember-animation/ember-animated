import { rAF, currentFrameClock } from './concurrency-helpers';
const currentCurves = [];

/*
  A Tween automatically recalculates on demand at most once per
  animation frame. As long as you're using the rAF helper from
  './concurrency-helpers', it will always be fresh. When many
  concurrent Tweens are running over the same duration at the same
  time, we can avoid a lot of duplicate work and keep them in sync.
*/

export default class Tween {
  constructor(initialValue, finalValue, duration) {
    this.curve = MotionCurve.findOrCreate(duration);
    this.initialValue = initialValue;
    this.diff = finalValue - initialValue;
  }
  get currentValue() {
    return this.initialValue + this.diff * this.curve.spaceProgress;
  }
  get done() {
    return this.curve.done;
  }
}

class MotionCurve {
  // we share motion curves among all concurrent motions that have the
  // same duration that start in the same animation frame.
  static findOrCreate(duration) {
    let shared = currentCurves.find(c => c.duration === duration);
    if (shared) {
      return shared;
    }
    let created = new this(duration);
    currentCurves.push(created);
    rAF().then(() => {
      currentCurves.splice(currentCurves.indexOf(created), 1);
    });
    return created;
  }

  constructor(duration) {
    this.startTime = (new Date()).getTime();
    this.duration = duration;
    this._tick();
  }
  ease(p) {
    return 0.5 - Math.cos( p * Math.PI ) / 2;
  }
  _tick() {
    if (this._lastTick !== currentFrameClock) {
      this._lastTick = currentFrameClock;
      this._runTime = (new Date()).getTime() - this.startTime;
      this._timeProgress = this._runTime / this.duration;
      this._spaceProgress = this.ease(this._timeProgress);
      this._done = this._timeProgress >= 1;
    }
  }
  get runTime() {
    this._tick();
    return this._runTime;
  }
  get timeProgress() {
    this._tick();
    return this._timeProgress;
  }
  get spaceProgress() {
    this._tick();
    return this._spaceProgress;
  }
  get done() {
    this._tick();
    return this._done;
  }
}
