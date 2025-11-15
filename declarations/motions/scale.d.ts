import Motion, { type BaseOptions } from '../-private/motion.ts';
import type Sprite from '../-private/sprite.ts';
import { type TweenLike } from '../-private/tween.ts';
/**
  Smoothly scales _sprite_ from its the initial size to its final size.

  _sprite_ must have both `initialBounds` and `finalBounds` set.

  ```js
  for (let sprite of insertedSprites) {
    sprite.startAtSprite(beacons['source']);
    scale(sprite)
  }
  ```

  @function scale
  @export default
  @param {Sprite} sprite
  @return {Motion}
*/
export default function scale(sprite: Sprite, opts?: Partial<ScaleOptions>): Promise<any>;
interface ScaleOptions extends BaseOptions {
    easing: (time: number) => number;
}
export declare class Scale extends Motion<ScaleOptions> {
    widthTween: TweenLike | null;
    heightTween: TweenLike | null;
    animate(): Generator<Promise<unknown>, void, unknown>;
}
export {};
//# sourceMappingURL=scale.d.ts.map