import { rAF } from '../-private/concurrency-helpers';
import Motion, { type BaseOptions } from '../-private/motion';
import type Sprite from '../-private/sprite';
import Tween, { type TweenLike } from '../-private/tween';

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
export default function scale(
  sprite: Sprite,
  opts: Partial<ScaleOptions> = {},
) {
  return new Scale(sprite, opts).run();
}

interface ScaleOptions extends BaseOptions {
  easing: (time: number) => number;
}

export class Scale extends Motion<ScaleOptions> {
  widthTween: TweenLike | null = null;
  heightTween: TweenLike | null = null;

  *animate() {
    this.sprite.assertHasInitialBounds();
    this.sprite.assertHasFinalBounds();
    const sprite = this.sprite;

    const duration = this.duration;

    let initialWidthFactor, initialHeightFactor;

    if (sprite.originalInitialBounds) {
      // the sprite is going to start at its own native initial size,
      // which may differ from the initialBounds.width &
      // initialBounds.height that have been set for it. This
      // compensates with an initial scaling.
      initialWidthFactor =
        sprite.initialBounds.width / sprite.originalInitialBounds.width;
      initialHeightFactor =
        sprite.initialBounds.height / sprite.originalInitialBounds.height;
    } else {
      // the sprite is going to start at its own native final size
      initialWidthFactor =
        sprite.initialBounds.width / sprite.originalFinalBounds.width;
      initialHeightFactor =
        sprite.initialBounds.height / sprite.originalFinalBounds.height;
    }

    const widthFactor = sprite.finalBounds.width / sprite.initialBounds.width;
    const heightFactor =
      sprite.finalBounds.height / sprite.initialBounds.height;

    this.widthTween = new Tween(
      sprite.transform.a * initialWidthFactor,
      sprite.transform.a * initialWidthFactor * widthFactor,
      duration,
      this.opts.easing,
    );
    this.heightTween = new Tween(
      sprite.transform.d * initialHeightFactor,
      sprite.transform.d * initialHeightFactor * heightFactor,
      duration,
      this.opts.easing,
    );

    while (!this.widthTween.done || !this.heightTween.done) {
      sprite.scale(
        this.widthTween.currentValue / sprite.transform.a,
        this.heightTween.currentValue / sprite.transform.d,
      );
      yield rAF();
    }
  }
}
