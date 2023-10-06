import { rAF } from '../-private/concurrency-helpers.ts';
import Motion, { type BaseOptions } from '../-private/motion.ts';
import type Sprite from '../-private/sprite.ts';
import Tween from '../-private/tween.ts';

export default function compensateForScale(
  sprite: Sprite,
  opts: Partial<BaseOptions> = {},
) {
  return new CompensateForScale(sprite, opts).run();
}

export class CompensateForScale extends Motion {
  widthTween: Tween | null = null;
  heightTween: Tween | null = null;

  *animate() {
    let duration = this.duration;

    this.sprite.assertHasInitialBounds();
    this.sprite.assertHasFinalBounds();
    let sprite = this.sprite;

    let widthFactor =
      sprite.finalCumulativeTransform.a / sprite.initialCumulativeTransform.a;
    let heightFactor =
      sprite.finalCumulativeTransform.d / sprite.initialCumulativeTransform.d;

    this.widthTween = new Tween(
      sprite.transform.a,
      sprite.transform.a * widthFactor,
      duration,
    );
    this.heightTween = new Tween(
      sprite.transform.d,
      sprite.transform.d * heightFactor,
      duration,
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
