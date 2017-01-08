import { spawn, fork, logErrors } from './micro-routines';


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
    fork(function * () {
      self.onMotionStart(motion.sprite);
      try {
        yield * motion._run();
      } finally {
        self.onMotionEnd(motion.sprite);
      }
    });
    return motion._promise;
  }
  _runToCompletion(transition) {
    let self = this;
    return spawn(function * () {
      logErrors(onError);
      yield * transition.call(self)
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
