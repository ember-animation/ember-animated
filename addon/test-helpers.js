import Ember from 'ember';
import RSVP from 'rsvp';
import { clock, rAF } from './concurrency-helpers';
import { task } from 'ember-concurrency';
import Motion from './motion';
import Sprite from './sprite';


export function macroWait() {
  let ticket;
  let promise = new RSVP.Promise(resolve => {
    ticket = setTimeout(resolve, 0);
  });
  promise.__ec_cancel__ = () => {
    clearTimeout(ticket);
  };
  return promise;
}

// This method must be installed on a context with an owner. Expected
// usage is to put it on an integration test context.
export function waitForAnimations() {
  let idle;
  Ember.run(() => {
    idle = Ember.getOwner(this).lookup('service:-ea-motion').get('waitUntilIdle').perform();
  });
  return idle;
}

let origNow = clock.now;

export class TimeControl {
  constructor() {
    if (clock.now !== origNow) {
      throw new Error("Only one TimeControl may be active at a time");
    }
    this._timer = 0;
    clock.now = () => this.now();
  }
  finished() {
    clock.now = origNow;
  }
  now() {
    return this._timer;
  }
  advance(ms) {
    this._timer += ms;
    return rAF().then(() => rAF());
  }
}

export const MotionTester = Ember.Object.extend({
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
  runner: task(function * (motion) {
    this.beforeAnimation(motion);
    yield * motion._run();
    this.afterAnimation(motion);
  })
});
