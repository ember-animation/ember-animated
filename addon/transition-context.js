import { DEBUG } from '@glimmer/env';
import {
  spawnChild,
  childrenSettled
} from './scheduler';


export default class TransitionContext {
  constructor(duration, insertedSprites, keptSprites, removedSprites, sentSprites, receivedSprites) {
    this.duration = duration;
    this.insertedSprites = insertedSprites;
    this.keptSprites = keptSprites;
    this.removedSprites = removedSprites;
    this.sentSprites = sentSprites;
    this.receivedSprites = receivedSprites;
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
      return type + '=' + this[`${type}Sprites`].map(s => s.owner.id).join(',')
    }).join(" | "));
  };
}
