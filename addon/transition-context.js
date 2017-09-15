import {
  spawnChild,
  childrenSettled
} from './scheduler';


export default class TransitionContext {
  constructor(duration, insertedSprites, keptSprites, removedSprites) {
    this.duration = duration;
    this.insertedSprites = insertedSprites;
    this.keptSprites = keptSprites;
    this.removedSprites = removedSprites;
  }
  animate(motion) {
    if (motion.duration == null) {
      motion.duration = this.duration;
    }
    let self = this;
    return spawnChild(function *() {
      self.onMotionStart(motion.sprite);
      try {
        yield * motion._run();
      } finally {
        self.onMotionEnd(motion.sprite);
      }
    });
  }
  *_runToCompletion(transition) {
    yield * transition.call(this);
    yield childrenSettled();
  }
}
