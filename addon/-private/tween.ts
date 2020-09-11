import { rAF, currentFrameClock, clock } from './concurrency-helpers';
import { easeInAndOut } from '../easings/cosine';
const currentCurves: MotionCurve[] = [];

/*
  A Tween automatically recalculates on demand at most once per
  animation frame. As long as you're using the rAF helper from
  './concurrency-helpers', it will always be fresh. When many
  concurrent Tweens are running over the same duration at the same
  time, we can avoid a lot of duplicate work and keep them in sync.
*/

export default class Tween {
  private curve: MotionCurve;
  private diff: number;

  constructor(
    readonly initialValue: number,
    readonly finalValue: number,
    duration: number,
    easing = easeInAndOut,
  ) {
    if (typeof easing !== 'function') {
      throw new Error('Tried to make a Tween with an invalid easing function');
    }
    this.curve = MotionCurve.findOrCreate(duration, easing);
    this.diff = finalValue - initialValue;
  }
  get currentValue() {
    return this.initialValue + this.diff * this.curve.spaceProgress;
  }
  get done() {
    return this.curve.done;
  }
  plus(otherTween: Tween | DerivedTween) {
    return new DerivedTween(
      [this, otherTween],
      (a: Tween | DerivedTween, b: Tween | DerivedTween) =>
        a.currentValue + b.currentValue,
    );
  }
}

export class DerivedTween {
  private _finalValue: number | null = null;
  private inputs: (Tween | DerivedTween)[];

  constructor(
    inputs: (Tween | DerivedTween)[],
    private combinator: (...inputs: (Tween | DerivedTween)[]) => number,
  ) {
    this._finalValue = null;
    this.inputs = inputs.map(t => {
      if (t.done) {
        // If one of our inputs has already finished, we can just keep its final
        // value around and drop the reference to the original Tween. This
        // prevents long chains of derived tweens from growing without bound
        // during continuous animations.
        return new Tween(t.currentValue, t.currentValue, 0);
      } else {
        return t;
      }
    });
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
  get done(): boolean {
    return !this.inputs.find(t => !t.done);
  }
}

class MotionCurve {
  // we share motion curves among all concurrent motions that have the
  // same duration that start in the same animation frame.
  static findOrCreate(duration: number, easing: (t: number) => number) {
    let shared = currentCurves.find(
      c => c.duration === duration && c.easing === easing,
    );
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

  private startTime: number;
  private _doneFrames = 0;
  private _lastTick: number | undefined;
  private _runTime: number | undefined;
  private _timeProgress: number | undefined;
  private _spaceProgress: number | undefined;

  constructor(
    readonly duration: number,
    private easing: (t: number) => number,
  ) {
    this.startTime = clock.now();
    this._tick();
  }
  _tick() {
    if (this._lastTick !== currentFrameClock) {
      this._lastTick = currentFrameClock;
      this._runTime = clock.now() - this.startTime;
      this._timeProgress =
        this.duration === 0 ? 1 : Math.min(this._runTime / this.duration, 1);
      this._spaceProgress = this.easing(this._timeProgress);
      if (this._timeProgress >= 1) {
        this._doneFrames++;
      }
    }
  }
  get runTime() {
    this._tick();
    return this._runTime!;
  }
  get timeProgress() {
    this._tick();
    return this._timeProgress!;
  }
  get spaceProgress() {
    this._tick();
    return this._spaceProgress!;
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
