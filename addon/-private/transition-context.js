import { childrenSettled } from './scheduler';

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
    // Link them up, so that users can conveniently pass sprites
    // around to Motions without also passing the transition context.
    sprites.forEach(sprite => sprite._transitionContext = this);

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

  *_runToCompletion(transition) {
    yield * transition(this);
    yield childrenSettled();
  }
}
