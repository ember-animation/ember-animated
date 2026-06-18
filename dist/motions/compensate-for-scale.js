import { rAF } from '../-private/concurrency-helpers.js';
import Motion from '../-private/motion.js';
import Tween from '../-private/tween.js';

function compensateForScale(sprite, opts = {}) {
  return new CompensateForScale(sprite, opts).run();
}
class CompensateForScale extends Motion {
  widthTween = null;
  heightTween = null;
  *animate() {
    let duration = this.duration;
    this.sprite.assertHasInitialBounds();
    this.sprite.assertHasFinalBounds();
    let sprite = this.sprite;
    let widthFactor = sprite.finalCumulativeTransform.a / sprite.initialCumulativeTransform.a;
    let heightFactor = sprite.finalCumulativeTransform.d / sprite.initialCumulativeTransform.d;
    this.widthTween = new Tween(sprite.transform.a, sprite.transform.a * widthFactor, duration);
    this.heightTween = new Tween(sprite.transform.d, sprite.transform.d * heightFactor, duration);
    while (!this.widthTween.done || !this.heightTween.done) {
      sprite.scale(this.widthTween.currentValue / sprite.transform.a, this.heightTween.currentValue / sprite.transform.d);
      yield rAF();
    }
  }
}

export { CompensateForScale, compensateForScale as default };
//# sourceMappingURL=compensate-for-scale.js.map
