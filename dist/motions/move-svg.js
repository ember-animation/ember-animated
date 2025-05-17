import Motion from '../-private/motion.js';
import '../-private/sprite.js';
import Tween from '../-private/tween.js';
import { rAF } from '../-private/concurrency-helpers.js';

function moveSVG(dimension, sprite, opts = {}) {
  return new MoveSVG(dimension, sprite, opts).run();
}
moveSVG.property = function (propertyName) {
  return this.bind(null, propertyName);
};
class MoveSVG extends Motion {
  prior = null;
  tween = null;
  constructor(dimension, sprite, opts = {}) {
    super(sprite, opts);
    this.dimension = dimension;
  }
  interrupted(motions) {
    this.prior = motions.find(m => m instanceof MoveSVG && m.dimension === this.dimension
    // SAFETY: We just checked the type of this
    );
  }
  *animate() {
    if (this.prior) {
      let prior = this.prior;
      prior.assertHasTween();
      this.tween = new Tween(0, Number(this.sprite.getFinalDimension(this.dimension)) - prior.tween.finalValue, this.duration, this.opts.easing).plus(prior.tween);
    } else {
      this.tween = new Tween(Number(this.sprite.getInitialDimension(this.dimension)), Number(this.sprite.getFinalDimension(this.dimension)), this.duration, this.opts.easing);
    }
    while (!this.tween.done) {
      // SAFETY: This is not very safe!
      this.sprite.element[this.dimension].baseVal.value = this.tween.currentValue;
      yield rAF();
    }
  }
  assertHasTween() {
    if (!this.tween) {
      throw new Error(`motion does not have tween`);
    }
  }
}

export { MoveSVG, moveSVG as default };
//# sourceMappingURL=move-svg.js.map
