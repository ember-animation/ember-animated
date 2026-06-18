import { childrenSettled } from './scheduler.js';
import { getOrCreate } from './singleton.js';

const spriteContext = getOrCreate('transition-context', () => new WeakMap());
function* runToCompletion(context, transition) {
  yield* transition(context);
  yield childrenSettled();
}
class TransitionContext {
  static forSprite(sprite) {
    return spriteContext.get(sprite);
  }
  _prepared = new Set();
  prepareSprite;
  constructor(_duration, _insertedSprites, _keptSprites, _removedSprites, _sentSprites, _receivedSprites, _beacons, onMotionStart, onMotionEnd) {
    this._duration = _duration;
    this._insertedSprites = _insertedSprites;
    this._keptSprites = _keptSprites;
    this._removedSprites = _removedSprites;
    this._sentSprites = _sentSprites;
    this._receivedSprites = _receivedSprites;
    this._beacons = _beacons;
    this.onMotionStart = onMotionStart;
    this.onMotionEnd = onMotionEnd;
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
  get beacons() {
    return this._beacons;
  }
  _prepareSprites(sprites) {
    // Link them up, so that users can conveniently pass sprites
    // around to Motions without also passing the transition context.
    sprites.forEach(sprite => {
      spriteContext.set(sprite, this);
    });
    if (!this.prepareSprite) {
      return sprites;
    }
    return sprites.map(sprite => {
      if (!this._prepared.has(sprite)) {
        this._prepared.add(sprite);
        sprite = this.prepareSprite(sprite);
      }
      return sprite;
    });
  }
}

export { TransitionContext as default, runToCompletion };
//# sourceMappingURL=transition-context.js.map
