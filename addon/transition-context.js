export default class TransitionContext {
  constructor(insertedSprites, keptSprites, removedSprites, farMatches) {
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
}
