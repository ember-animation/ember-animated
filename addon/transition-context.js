import {
  spawnChild,
  childrenSettled
} from './scheduler';


export default class TransitionContext {
  constructor(duration, insertedSprites, keptSprites, removedSprites, farMatches) {
    this.duration = duration;
    this.insertedSprites = insertedSprites;
    this.keptSprites = keptSprites;
    this.removedSprites = removedSprites;
    this._farMatches = farMatches;
  }
  matchFor(sprite) {
    return this._farMatches.get(sprite);
  }
  get insertedSprite() {
    return this.insertedSprites[0];
  }
  get keptSprite() {
    return this.keptSprites[0];
  }
  get removedSprite() {
    return this.removedSprites[0];
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
