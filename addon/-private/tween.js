import { rAF, currentFrameClock, clock } from './concurrency-helpers';
import { easeInAndOut } from '../easings/cosine';
const currentCurves = [];

/*
  A Tween automatically recalculates on demand at most once per
  animation frame. As long as you're using the rAF helper from
  './concurrency-helpers', it will always be fresh. When many
  concurrent Tweens are running over the same duration at the same
  time, we can avoid a lot of duplicate work and keep them in sync.
*/

export default class Tween {
  constructor(initialValue, finalValue, duration, easing=easeInAndOut) {
    if (typeof easing !== 'function') {
      throw new Error("Tried to make a Tween with an invalid easing function");
    }
    this.curve = MotionCurve.findOrCreate(duration, easing);
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
  static findOrCreate(duration, easing) {
    let shared = currentCurves.find(c => c.duration === duration && c.easing === easing);
    if (shared) {
      return shared;
    }
    let created = new this(duration, easing);
    currentCurves.push(created);
    rAF().then(() => {
      currentCurves.splice(currentCurves.indexOf(created), 1);
    });
    return created;
  }

  constructor(duration, easing) {
    this.startTime = clock.now();
    this.duration = duration;
    this.easing = easing;
    this._doneFrames = 0;
    this._tick();
  }
  _tick() {
    if (this._lastTick !== currentFrameClock) {
      this._lastTick = currentFrameClock;
      this._runTime = clock.now() - this.startTime;
      this._timeProgress = this.duration === 0 ? 1 : Math.min(this._runTime / this.duration, 1);
      this._spaceProgress = Math.min(this.easing(this._timeProgress), 1);
      if (this._timeProgress >= 1) {
        this._doneFrames++;
      }
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

  // Tweens are not considered done until they have been done for more
  // than one frame. This allows you to write animations like:
  //
  //     while (!tween.done) {
  //       doSomethingWith(tween.currentValue);
  //       yield rAF();
  //     }
  //
  // while being sure that doSomethingWith will actually be called at
  // least once with the final value. The alternative ways to
  // accomplish that:
  //
  //     while (!tween.done) {
  //       yield rAF(); // <-- may cause flicker
  //       doSomethingWith(tween.currentValue);
  //      }
  //
  //  or
  //
  //     while (!tween.done) {
  //       doSomethingWith(tween.currentValue);
  //       yield rAF();
  //     }
  //     doSomethingWith(tween.currentValue);
  //
  //  Either allow flicker or require animation authors to remember to
  //  repeat themselves.
  get done() {
    this._tick();
    return this._doneFrames > 1;
  }
}
