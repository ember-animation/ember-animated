import { DEBUG } from '@glimmer/env';
import {
  spawnChild,
  childrenSettled
} from './scheduler';

export default class TransitionContext {
  constructor(duration, insertedSprites, keptSprites, removedSprites, sentSprites, receivedSprites) {
    this._duration = duration;
    this._insertedSprites = insertedSprites;
    this._keptSprites = keptSprites;
    this._removedSprites = removedSprites;
    this._sentSprites = sentSprites;
    this._receivedSprites = receivedSprites;
    this._prepared = new Set();
  }

  // the following things are all accessors in order to make them
  // read-only, and to let us tell which classes of sprites a user's
  // transition is actually using.

  get duration() {
    return this._duration;
  }
  get insertedSprites() {
    return this._prepareSprites(this._insertedSprites);
  }
  get keptSprites() {
    return this._prepareSprites(this._keptSprites);
  }
  get removedSprites() {
    return this._prepareSprites(this._removedSprites);
  }
  get sentSprites() {
    return this._prepareSprites(this._sentSprites);
  }
  get receivedSprites() {
    return this._prepareSprites(this._receivedSprites);
  }

  _prepareSprites(sprites) {
    if (!this.prepareSprite) {
      return sprites;
    }
    return sprites.map(sprite => {
      if (!this._prepared.has(sprite)){
        this._prepared.add(sprite);
        sprite = this.prepareSprite(sprite);
      }
      return sprite;
    });
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

if (DEBUG) {
  TransitionContext.prototype.printSprites = function (label){
    let prefix = label ? label + ' ' : '';
    /* eslint no-console:0 */
    console.log(prefix + ['inserted', 'kept', 'removed', 'sent', 'received'].map(type => {
      return type + '=' + this[`_${type}Sprites`].map(s => s.owner.id).join(',')
    }).join(" | "));
  };
} else {
  TransitionContext.prototype.printSprites = function(){};
}
