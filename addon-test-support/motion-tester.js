import { alias } from '@ember/object/computed';
import EmberObject from '@ember/object';
import { task } from 'ember-animated/-private/ember-scheduler';
import { Motion } from 'ember-animated';
import Sprite from 'ember-animated/-private/sprite';

export default EmberObject.extend({
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
