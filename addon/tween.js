import { rAF, currentFrameClock, clock } from './concurrency-helpers';
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
    this.finalValue = finalValue;
    this.diff = finalValue - initialValue;
  }
  get currentValue() {
    return this.initialValue + this.diff * this.curve.spaceProgress;
  }
  get done() {
    return this.curve.done;
  }
  plus(otherTween) {
    return new DerivedTween(
      [this, otherTween],
      (a,b) => a.currentValue + b.currentValue
    );
  }
}

class DerivedTween {
  constructor(inputs, combinator) {
    this._finalValue = null;
    this.inputs = inputs.map(t => {
      if (t.done) {
        // If one of our inputs has already finished, we can just keep
        // its final value around and drop the reference to the actual
        // Tween. This prevents long chains of derived tweens from
        // growing without bound during continuous animations.
        return { currentValue: t.currentValue, done: true, finalValue: t.finalValue };
      } else {
        return t;
      }
    });
    this.combinator = combinator;
  }
  get finalValue() {
    if (this._finalValue == null) {
      let accum = 0;
      for (let i = 0; i < this.inputs.length; i++) {
        accum += this.inputs[i].finalValue;
      }
      this._finalValue = accum;
    }
    return this._finalValue;
  }
  get currentValue() {
    return this.combinator(...this.inputs);
  }
  get done() {
    return !this.inputs.find(t => !t.done);
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
    this.startTime = clock.now();
    this.duration = duration;
    this._tick();
  }
  ease(p) {
    return 0.5 - Math.cos( p * Math.PI ) / 2;
  }
  _tick() {
    if (this._lastTick !== currentFrameClock) {
      this._lastTick = currentFrameClock;
      this._runTime = clock.now() - this.startTime;
      this._timeProgress = Math.min(this._runTime / this.duration, 1);
      this._spaceProgress = Math.min(this.ease(this._timeProgress), 1);
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
