import { Motion, rAF, Tween } from '..';
import { BaseOptions } from '../-private/motion';
import { DerivedTween } from '../-private/tween';
import Sprite from '../-private/sprite';

interface Options extends BaseOptions {
  easing: (t: number) => number;
}

/**
  Smoothly resizes _sprite_ from its the initial size to its final size.

  _sprite_ must have both `initialBounds` and `finalBounds` set.

  Consider using `scale` instead because scale uses CSS transforms and will not trigger reflow.

  ```js
  for (let sprite of insertedSprites) {
    sprite.startAtSprite(beacons['source']);
    resize(sprite)
  }
  ```

  @function resize
  @export default
  @param {Sprite} sprite
  @return {Motion}
*/
export default function resize(sprite: Sprite, opts: Partial<Options> = {}) {
  return new Resize(sprite, opts).run();
}

export class Resize extends Motion<Options> {
  prior: Resize | null = null;
  widthTween: Tween | DerivedTween | null = null;
  heightTween: Tween | DerivedTween | null = null;

  interrupted(motions: Motion[]) {
    let prior = motions.find((m) => m instanceof this.constructor);
    if (prior) {
      this.prior = prior as Resize;
    }
  }

  *animate() {
    let sprite: Sprite = this.sprite;
    let duration = this.duration;
    let widthTween: Tween | DerivedTween;
    let heightTween: Tween | DerivedTween;

    sprite.assertHasInitialBounds();
    sprite.assertHasFinalBounds();

    if (!this.prior) {
      widthTween = this.widthTween = new Tween(
        sprite.initialBounds.width / sprite.initialCumulativeTransform.a,
        sprite.finalBounds.width / sprite.finalCumulativeTransform.a,
        duration,
        this.opts.easing,
      );
      heightTween = this.heightTween = new Tween(
        sprite.initialBounds.height / sprite.initialCumulativeTransform.d,
        sprite.finalBounds.height / sprite.finalCumulativeTransform.d,
        duration,
        this.opts.easing,
      );
    } else {
      widthTween = this.widthTween = new Tween(
        0,
        sprite.finalBounds.width / sprite.finalCumulativeTransform.a -
          this.prior.sprite.finalBounds!.width,
        duration,
        this.opts.easing,
      ).plus(this.prior.widthTween!);
      heightTween = this.heightTween = new Tween(
        0,
        sprite.finalBounds.height / sprite.finalCumulativeTransform.d -
          this.prior.sprite.finalBounds!.height,
        duration,
        this.opts.easing,
      ).plus(this.prior.heightTween!);
    }

    while (!widthTween.done || !heightTween.done) {
      sprite.applyStyles({
        width: `${widthTween.currentValue}px`,
        height: `${heightTween.currentValue}px`,
      });
      yield rAF();
    }
  }
}
