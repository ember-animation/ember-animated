import Motion, { type BaseOptions } from '../-private/motion.ts';
import type Sprite from '../-private/sprite.ts';
import { type TweenLike } from '../-private/tween.ts';
export default function opacity(sprite: Sprite, opts?: Partial<OpacityOptions>): Promise<any>;
/**
  Animates in a sprite from 0% to 100% opacity.

  ```js
  for (let sprite of insertedSprites) {
    fadeIn(sprite)
  }
  ```

  @function fadeIn
  @param {Sprite} sprite
  @return {Motion}
*/
export declare function fadeIn(sprite: Sprite, opts?: Partial<OpacityOptions>): Promise<any>;
/**
  Animates out a sprite from 100% to 0% opacity.

  ```js
  for (let sprite of removedSprites) {
    fadeOut(sprite)
  }
  ```

  @function fadeOut
  @param {Sprite} sprite
  @return {Motion}
*/
export declare function fadeOut(sprite: Sprite, opts?: Partial<OpacityOptions>): Promise<any>;
interface OpacityOptions extends BaseOptions {
    from: number;
    to: number;
    easing: (time: number) => number;
}
export declare class Opacity extends Motion<OpacityOptions> {
    prior: Opacity | null | undefined;
    tween: TweenLike | null;
    interrupted(motions: Motion[]): void;
    animate(): Generator<Promise<unknown>, void, unknown>;
    assertHasTween(): asserts this is OpacityWithTween;
}
interface OpacityWithTween extends Opacity {
    tween: TweenLike;
}
export {};
//# sourceMappingURL=opacity.d.ts.map