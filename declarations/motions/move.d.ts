import Motion, { type BaseOptions } from '../-private/motion.ts';
import type Sprite from '../-private/sprite.ts';
import { type TweenLike } from '../-private/tween.ts';
/**
  Animates _sprite_ from its initial position to its final position.

  _sprite_ must have both `initialBounds` and `finalBounds` set.

  ```js
  for (let sprite of keptSprites) {
    move(sprite)
  }
  ```

  @function move
  @export default
  @param {Sprite} sprite
  @return {Motion}
*/
export default function move(sprite: Sprite, opts?: Partial<MoveOptions>): Promise<any>;
export interface MoveOptions extends BaseOptions {
    easing: (time: number) => number;
}
export declare class Move<T extends MoveOptions = MoveOptions> extends Motion<T> {
    prior: Move | undefined | null;
    xTween: TweenLike | null;
    yTween: TweenLike | null;
    interrupted(motions: Motion[]): void;
    animate(): Generator<Promise<unknown>, void, unknown>;
    _moveIt(): Generator<Promise<unknown>, void, unknown>;
    assertHasTweens(): asserts this is MoveWithTweens;
}
interface MoveWithTweens extends Move {
    xTween: TweenLike;
    yTween: TweenLike;
}
export declare function continuePrior(sprite: Sprite, opts?: Partial<MoveOptions>): Promise<any>;
export declare class ContinuePrior extends Move {
    animate(): Generator<Promise<unknown>, void, unknown>;
}
export {};
//# sourceMappingURL=move.d.ts.map