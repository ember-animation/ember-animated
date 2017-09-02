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

    // How far our sprite needs to move.
    let dx, dy;
    {
      let initial = sprite.initialBounds;
      let final = sprite.finalBounds;
      dx = final.left - initial.left;
      dy = final.top - initial.top;
    }

    if (!this.prior) {
      // when starting a new move we start from its current position
      // (sprite.transform) and offset that based on the change in
      // bounds we want.
      this.xTween = new Tween(
        sprite.transform.tx,
        sprite.transform.tx + dx,
        fuzzyZero(dx) ? 0 : duration
      );

      this.yTween = new Tween(
        sprite.transform.ty,
        sprite.transform.ty + dy,
        fuzzyZero(dy) ? 0 : duration
      );
    } else {
      // Here we are interrupting a prior Move.
      let priorXTween = this.prior.xTween;
      let priorYTween = this.prior.yTween;

      // The transformDiffs account for the fact that our old and new
      // tweens may be measuring from different origins.
      let transformDiffX = sprite.transform.tx - priorXTween.currentValue;
      let transformDiffY = sprite.transform.ty - priorYTween.currentValue;

      // We adjust our move distances so that they cancel out the
      // remainder of the previous move.
      dx -= priorXTween.finalValue - priorXTween.currentValue;
      dy -= priorYTween.finalValue - priorYTween.currentValue;

      if (fuzzyZero(dx)) {
        // If our interrupting move is actually going to the same place
        // we were already going, we don't really want to extend the
        // time of the overall animation (it looks funny when you're
        // waiting around for nothing to happen).
        this.xTween = priorXTween;
      } else {
        // We add our new differential tweens to the prior tweens. This
        // is the magic that gives us smooth continuity. At the very
        // start, the old tween will dominate because the new tween
        // hasn't ramped up its motion yet. As the old tween finishes,
        // the new tween begins to dominate. Because of the adjustments
        // we did above, the sum of both tweens will end up right where
        // we want to be.
        this.xTween = new Tween(transformDiffX, transformDiffX + dx, duration).plus(this.prior.xTween);
      }

      // Now repeat what we just did above, but for the y dimension.
      if (fuzzyZero(dy)) {
        this.yTween = priorYTween;
      } else {
        this.yTween = new Tween(transformDiffY, transformDiffY + dy, duration).plus(this.prior.yTween);
      }
    }

    while (true) {
      yield rAF();
      sprite.translate(
        this.xTween.currentValue - sprite.transform.tx,
        this.yTween.currentValue - sprite.transform.ty
      );
      if (this.xTween.done && this.yTween.done) {
        break;
      }
    }
  }
}

// Because sitting around while your sprite animates by tiny fractions
// of a pixel is no fun.
function fuzzyZero(number) {
  // This magnitude was chosen because differences of 1/10th of a pixel should not matter visually.
  return Math.abs(number) < 0.1;
}
