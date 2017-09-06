import Motion from '../motion';
import Tween from '../tween';
import { rAF } from '../concurrency-helpers';

export default class Opacity extends Motion {
  constructor(sprite, opts) {
    super(sprite, opts);
    this.prior = null;
    this.opacityTween = null;
    this.opacityFrom = opts && opts.initialOpacity || 0;
    this.opacityTo = opts && opts.initialOpacity || 1;
    if (opts && opts.duration != null) {
      this.duration = opts.duration;
    }
  }

  interrupted(motions) {
    this.prior = motions.find(m => m instanceof this.constructor);
  }

  * animate() {
    let { sprite, duration } = this;
    this.opacityTween = new Tween(this.opacityFrom, this.opacityTo, duration);

    while (true) {
      yield rAF();
      sprite.applyStyles({
        opacity: this.opacityTween.currentValue
      });
      if (this.opacityTween.done) {
        break;
      }
    }
  }
}
