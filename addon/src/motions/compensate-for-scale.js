import { rAF } from '../-private/concurrency-helpers';
import Motion from '../-private/motion';
import Tween from '../-private/tween';

export default function compensateForScale(sprite, opts) {
  return new CompensateForScale(sprite, opts).run();
}

export class CompensateForScale extends Motion {
  constructor(sprite, opts) {
    super(sprite, opts);
    this.widthTween = null;
    this.heightTween = null;
  }

  *animate() {
    let sprite = this.sprite;
    let duration = this.duration;

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
