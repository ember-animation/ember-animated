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
    motion.sprite.reveal();
    try {
      yield * motion._run();
    } finally {
      motion.sprite.motionEnded();
    }
  }
  *_runToCompletion(transition) {
    this._scheduler.spawn(transition.call(this));
    yield * this._scheduler.run();

    // The following cleanup ensures that all the sprites that will
    // stay on the page after our animation are unlocked and
    // revealed. We may have already revealed most of them, but if an
    // inserted sprite was never subject to a motion it will appear
    // here, and if a previous transition was interrupted before an
    // inserted sprite could be revealed, it could have become a kept
    // sprite for us.
    this.keptSprites.forEach(sprite => {
      sprite.unlock();
      sprite.reveal();
    });
    this.insertedSprites.forEach(sprite => {
      sprite.unlock();
      sprite.reveal();
    });
  }
}

function onError(reason) {
  if (reason.name !== 'TaskCancelation') {
    setTimeout(function() {
      throw reason;
    }, 0);
  }
}
