import { childrenSettled } from './scheduler';
import Sprite from './sprite';
import { Transition } from './transition';

const spriteContext = new WeakMap();

export function* runToCompletion(
  context: TransitionContext,
  transition: Transition,
) {
  yield* transition(context);
  yield childrenSettled();
}

export default class TransitionContext {
  static forSprite(sprite: Sprite): TransitionContext {
    return spriteContext.get(sprite);
  }

  private _prepared: Set<Sprite> = new Set();

  prepareSprite: ((sprite: Sprite) => Sprite) | undefined;

  constructor(
    private _duration: number,
    private _insertedSprites: Sprite[],
    private _keptSprites: Sprite[],
    private _removedSprites: Sprite[],
    private _sentSprites: Sprite[],
    private _receivedSprites: Sprite[],
    private _beacons: { [name: string]: Sprite },
    readonly onMotionStart: (sprite: Sprite) => void,
    readonly onMotionEnd: (sprite: Sprite) => void,
  ) {}

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

  private _prepareSprites(sprites: Sprite[]): Sprite[] {
    // Link them up, so that users can conveniently pass sprites
    // around to Motions without also passing the transition context.
    sprites.forEach((sprite) => {
      spriteContext.set(sprite, this);
    });
    if (!this.prepareSprite) {
      return sprites;
    }
    return sprites.map((sprite) => {
      if (!this._prepared.has(sprite)) {
        this._prepared.add(sprite);
        sprite = this.prepareSprite!(sprite);
      }
      return sprite;
    });
  }
}
