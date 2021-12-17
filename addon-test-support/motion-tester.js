import { alias } from '@ember/object/computed';
import EmberObject from '@ember/object';
import { task } from 'ember-animated/-private/ember-scheduler';
import { Motion } from 'ember-animated';
import Sprite from 'ember-animated/-private/sprite';
import TransitionContext from 'ember-animated/-private/transition-context';

export default EmberObject.extend({
  motion: null,
  duration: 1,
  beforeAnimation() {},
  afterAnimation() {},
  run(...args) {
    let motion;
    if (args[0] instanceof Motion) {
      motion = args[0];
    } else if (args[0] instanceof Sprite) {
      let M = this.motion;
      if (!M) {
        throw new Error(
          "passing a Sprite to MotionTester#run only works if you've already set a default motion",
        );
      }
      motion = new M(args[0]);
    } else {
      throw new Error(
        'first argument to MotionTester#run must be either a Motion or a Sprite',
      );
    }

    let duration = this.duration;
    if (args.length > 1 && args[1].duration != null) {
      duration = args[1].duration;
    }

    let context = new TransitionContext(
      duration,
      [motion.sprite],
      [],
      [],
      [],
      [],
      {},
      () => null,
      () => null,
    );
    context.insertedSprites;
    return this.get('runner').perform(motion);
  },
  isAnimating: alias('runner.isRunning'),
  runner: task(function* (motion) {
    this.beforeAnimation(motion);
    yield* motion._run();
    this.afterAnimation(motion);
  }).restartable(),
});
