import { clock, rAF } from '../-private/concurrency-helpers.js';
import { getOrCreate } from '../-private/singleton.js';

let origNow = getOrCreate('time-control', () => clock.now);
class TimeControl {
  constructor() {
    if (clock.now !== origNow) {
      throw new Error('Only one TimeControl may be active at a time');
    }
    this._timer = origNow();
    this._runningSpeed = false;
    this._runStartedAt = null;
    clock.now = () => this.now();
  }
  finished() {
    clock.now = origNow;
  }
  now() {
    if (this._runningSpeed) {
      return (origNow() - this._runStartedAt) * this._runningSpeed + this._timer;
    }
    return this._timer;
  }
  advance(ms) {
    if (this._runningSpeed) {
      throw new Error("You can't advance a running TimeControl. Use either runAtSpeed or advance but not both at once.");
    }
    this._timer += ms;
    // This waits for three frames because:
    //
    //   1. You need at least two rAFs to guarantee that everybody
    //   else who is running at rAF frequency had a chance to run
    //   (because you don't know which ones ran before you in the same
    //   frame).
    //
    //   2. Our Tween system doesn't mark Tweens as done until they
    //   had a whole frame in their "done" state (see comments in
    //   ./tween.js).
    return rAF().then(rAF).then(rAF);
  }
  runAtSpeed(factor) {
    this._timer = this.now();
    this._runningSpeed = factor;
    this._runStartedAt = origNow();
  }
  pause() {
    this._timer = this.now();
    this._runningSpeed = false;
    this._runstartedAt = null;
  }
}

export { TimeControl as default };
//# sourceMappingURL=time-control.js.map
