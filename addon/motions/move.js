import Motion from '../motion';
import Tween from '../tween';
import { rAF } from '../concurrency-helpers';

export default class Move extends Motion {
  constructor(sprite, opts) {
    super(sprite, opts);
    this.prior = null;
    this.xTween = null;
    this.yTween = null;
  }

  interrupted(motions) {
    // We only need to track the prior Move we are replacing here,
    // because it will have done the same for any earlier ones.
    this.prior = motions.find(m => m instanceof this.constructor);
  }

  * animate() {
    let duration = this.opts.duration;
    let sprite = this.sprite;

    if (!this.prior) {
      // when starting a new move we start from its current position
      // (sprite.transform) and offset that based on the change in
      // bounds we want.
      let initial = sprite.initialBounds;
      let final = sprite.finalBounds;
      this.xTween = new Tween(
        sprite.transform.tx,
        sprite.transform.tx + final.left - initial.left,
        duration
      );
      this.yTween = new Tween(
        sprite.transform.ty,
        sprite.transform.ty + final.top - initial.top,
        duration
      );
    } else {
      // When interrupting an existing move, we create differential
      // tweens based on the difference in final bounds between the
      // old and new tweens.
      let initialView = this.prior.sprite.finalBounds;
      let finalView = sprite.finalBounds;
      let transformDiffX = sprite.transform.tx - this.prior.xTween.currentValue;
      let transformDiffY = sprite.transform.ty - this.prior.yTween.currentValue;
      let viewDiffX = finalView.left - initialView.left;
      let viewDiffY = finalView.top - initialView.top;
      this.xTween = new Tween(transformDiffX, transformDiffX + viewDiffX, duration).plus(this.prior.xTween);
      this.yTween = new Tween(transformDiffY, transformDiffY + viewDiffY, duration).plus(this.prior.yTween);
    }

    while (!this.xTween.done) {
      yield rAF();
      sprite.translate(
        this.xTween.currentValue - sprite.transform.tx,
        this.yTween.currentValue - sprite.transform.ty
      );
    }
  }
}
