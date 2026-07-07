import { rAF } from '../-private/concurrency-helpers.js';
import Motion from '../-private/motion.js';
import Tween from '../-private/tween.js';

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
function resize(sprite, opts = {}) {
  return new Resize(sprite, opts).run();
}
class Resize extends Motion {
  prior = null;
  widthTween = null;
  heightTween = null;
  interrupted(motions) {
    let prior = motions.find(m => m instanceof this.constructor);
    if (prior) {
      this.prior = prior;
    }
  }
  *animate() {
    let sprite = this.sprite;
    let duration = this.duration;
    let widthTween;
    let heightTween;
    sprite.assertHasInitialBounds();
    sprite.assertHasFinalBounds();
    if (!this.prior) {
      widthTween = this.widthTween = new Tween(sprite.initialBounds.width / sprite.initialCumulativeTransform.a, sprite.finalBounds.width / sprite.finalCumulativeTransform.a, duration, this.opts.easing);
      heightTween = this.heightTween = new Tween(sprite.initialBounds.height / sprite.initialCumulativeTransform.d, sprite.finalBounds.height / sprite.finalCumulativeTransform.d, duration, this.opts.easing);
    } else {
      widthTween = this.widthTween = new Tween(0, sprite.finalBounds.width / sprite.finalCumulativeTransform.a - this.prior.sprite.finalBounds.width, duration, this.opts.easing).plus(this.prior.widthTween);
      heightTween = this.heightTween = new Tween(0, sprite.finalBounds.height / sprite.finalCumulativeTransform.d - this.prior.sprite.finalBounds.height, duration, this.opts.easing).plus(this.prior.heightTween);
    }
    while (!widthTween.done || !heightTween.done) {
      sprite.applyStyles({
        width: `${widthTween.currentValue}px`,
        height: `${heightTween.currentValue}px`
      });
      yield rAF();
    }
  }
}

export { Resize, resize as default };
//# sourceMappingURL=resize.js.map
