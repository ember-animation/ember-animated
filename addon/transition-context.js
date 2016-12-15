import { Scheduler } from './micro-routines';


export default class TransitionContext {
  constructor(duration, insertedSprites, keptSprites, removedSprites, farMatches) {
    this.duration = duration;
    this._scheduler = new Scheduler(onError);
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
    this._scheduler.spawn(this._motionGenerator(motion));
    return motion._promise;
  }
  *_motionGenerator(motion) {
    this.onMotionStart(motion.sprite);
    try {
      yield * motion._run();
    } finally {
      this.onMotionEnd(motion.sprite);
    }
  }
  *_runToCompletion(transition) {
    this._scheduler.spawn(transition.call(this));
    yield * this._scheduler.run();
  }
}

function onError(reason) {
  if (reason.name !== 'TaskCancelation') {
    setTimeout(function() {
      throw reason;
    }, 0);
  }
}
