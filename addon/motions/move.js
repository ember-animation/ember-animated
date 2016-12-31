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
    let duration = this.duration;
    let sprite = this.sprite;

    if (!this.prior) {
      // when starting a new move we start from its current position
      // (sprite.transform) and offset that based on the change in
      // bounds we want.
      let initial = sprite.initialBounds;
      let final = sprite.finalBounds;

      let parentDiffX = 0;
      let parentDiffY = 0;
      if (sprite.parentInitialBounds && sprite.parentFinalBounds) {
        parentDiffX = sprite.parentFinalBounds.left - sprite.parentInitialBounds.left;
        parentDiffY = sprite.parentFinalBounds.top - sprite.parentInitialBounds.top;
      }

      this.xTween = new Tween(
        sprite.transform.tx,
        sprite.transform.tx + final.left - initial.left - parentDiffX,
        final.left === initial.left ? 0 : duration
      );

      this.yTween = new Tween(
        sprite.transform.ty,
        sprite.transform.ty + final.top - initial.top - parentDiffY,
        final.top === initial.top ? 0 : duration
      );
    } else {
      // Here we are interrupting a prior Move.

      // The transformDiffs account for the fact that our old and new
      // tweens may be measuring from different origins.
      let transformDiffX = sprite.transform.tx - this.prior.xTween.currentValue;
      let transformDiffY = sprite.transform.ty - this.prior.yTween.currentValue;

      // The viewDiffs account for the visual difference between where
      // the old tween was going and where the new tween is going.
      let viewDiffX;
      let viewDiffY;
      {
        let priorSprite = this.prior.sprite;
        let initialView = priorSprite.finalBounds;
        let finalView = sprite.finalBounds;
        viewDiffX = finalView.left - initialView.left;
        viewDiffY = finalView.top - initialView.top;

        if (priorSprite.parentFinalBounds && sprite.parentFinalBounds) {
          viewDiffX -= sprite.parentFinalBounds.left - priorSprite.parentFinalBounds.left;
          viewDiffY -= sprite.parentFinalBounds.top - priorSprite.parentFinalBounds.top;
        }
      }

      // If our interrupting move is actually going to the same place
      // we were already going, we don't really want to extend the
      // time of the overall animation (it looks funny when you're
      // waiting around for nothing to happen).
      let durationX = viewDiffX === 0 ? 0 : duration;
      let durationY = viewDiffY === 0 ? 0 : duration;

      // We add our new differential tweens to the prior tweens.
      this.xTween = new Tween(transformDiffX, transformDiffX + viewDiffX, durationX).plus(this.prior.xTween);
      this.yTween = new Tween(transformDiffY, transformDiffY + viewDiffY, durationY).plus(this.prior.yTween);
    }

    while (!this.xTween.done || !this.yTween.done) {
      yield rAF();
      sprite.translate(
        this.xTween.currentValue - sprite.transform.tx,
        this.yTween.currentValue - sprite.transform.ty
      );
    }
  }
}
