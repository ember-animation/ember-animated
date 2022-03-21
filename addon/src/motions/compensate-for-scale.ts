import { rAF } from '../-private/concurrency-helpers';
import Motion, { BaseOptions } from '../-private/motion';
import Sprite from '../-private/sprite';
import Tween from '../-private/tween';

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
