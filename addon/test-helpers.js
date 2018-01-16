import { alias } from '@ember/object/computed';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import { clock, rAF } from './concurrency-helpers';
import { task } from './ember-scheduler';
import Motion from './motion';
import Sprite from './sprite';


// This method must be installed on a context with an owner. Expected
// usage is to put it on an integration test context.
export function waitForAnimations() {
  let idle;
  run(() => {
    idle = getOwner(this).lookup('service:-ea-motion').get('waitUntilIdle').perform();
  });
  return resolve(idle);
}

let origNow = clock.now;

export class TimeControl {
  constructor() {
    if (clock.now !== origNow) {
      throw new Error("Only one TimeControl may be active at a time");
    }
    this._timer = 0;
    this._runningSpeed = false;
    this._runStartedAt = null;
    clock.now = () => this.now();
  }
  finished() {
    clock.now = origNow;
  }
  now() {
    if (this._runningSpeed) {
      return (origNow() - this._runStartedAt) * this._runningSpeed;
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
    this._runningSpeed = factor;
    this._runStartedAt = origNow();
  }

}

export const MotionTester = EmberObject.extend({
  motion: null,
  duration: 1,
  beforeAnimation(){},
  afterAnimation(){},
  run(...args) {
    let motion;
    if (args[0] instanceof Motion) {
      motion = args[0];
    } else if (args[0] instanceof Sprite) {
      let M = this.motion;
      if (!M) {
        throw new Error("passing a Sprite to MotionTester#run only works if you've already set a default motion");
      }
      motion = new M(args[0]);
    } else {
      throw new Error("first argument to MotionTester#run must be either a Motion or a Sprite");
    }

    if (motion.duration === null) {
      motion.duration = this.duration;
    }

    if (args.length > 1 && args[1].duration != null) {
      motion.duration = args[1].duration;
    }

    // Each motion contains its own promise that is used by
    // TransitionContext#animate so that a transition can wait for a
    // single motion to finish (as opposed to waiting for the whole
    // transition Task to finish). In this test harness, there is no
    // distinction, and this extra promises will just generate console
    // noise if it remains unconsumed.
    motion._promise.then(() => {}, () => {});

    return this.get('runner').perform(motion);
  },
  isAnimating: alias('runner.isRunning'),
  runner: task(function * (motion) {
    this.beforeAnimation(motion);
    yield * motion._run();
    this.afterAnimation(motion);
  }).restartable()
});
