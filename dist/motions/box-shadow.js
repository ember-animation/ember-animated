import { BoxShadow, BoxShadowTween } from '../box-shadow.js';
import Motion from '../-private/motion.js';
import { rAF } from '../-private/concurrency-helpers.js';

function boxShadow(sprite, opts = {}) {
  return new BoxShadowMotion(sprite, opts).run();
}
class BoxShadowMotion extends Motion {
  *animate() {
    let from;
    if (this.opts.from) {
      from = BoxShadow.fromUserProvidedShadow(this.opts.from);
    } else {
      this.sprite.assertHasInitialBounds();
      from = BoxShadow.fromComputedStyle(this.sprite.initialComputedStyle['box-shadow']);
    }
    let to;
    if (this.opts.to) {
      to = BoxShadow.fromUserProvidedShadow(this.opts.to);
    } else {
      this.sprite.assertHasFinalBounds();
      to = BoxShadow.fromComputedStyle(this.sprite.finalComputedStyle['box-shadow']);
    }
    let shadowTween = new BoxShadowTween(from, to, this.duration, this.opts.easing);
    while (!shadowTween.done) {
      this.sprite.applyStyles({
        'box-shadow': shadowTween.currentValue.map(shadow => shadow.toString()).join(',')
      });
      yield rAF();
    }
  }
}

export { BoxShadowMotion, boxShadow as default };
//# sourceMappingURL=box-shadow.js.map
