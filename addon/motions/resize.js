import { Motion, rAF, Tween } from '..';

export default function resize(sprite, opts) {
  return new Resize(sprite, opts).run();
}

export class Resize extends Motion {
  constructor(sprite, opts) {
    super(sprite, opts);
    this.prior = null;
    this.widthTween = null;
    this.heightTween = null;
  }

  interrupted(motions) {
    this.prior = motions.find(m => m instanceof this.constructor);
  }

  * animate() {
    let sprite = this.sprite;
    let duration = this.duration;

    if (!this.prior) {
      this.widthTween = new Tween(
        sprite.initialBounds.width / sprite.initialCumulativeTransform.a,
        sprite.finalBounds.width / sprite.finalCumulativeTransform.a,
        duration,
        this.opts.easing
      );
      this.heightTween = new Tween(
        sprite.initialBounds.height / sprite.initialCumulativeTransform.d,
        sprite.finalBounds.height / sprite.finalCumulativeTransform.d,
        duration,
        this.opts.easing
      );
    } else {
      this.widthTween = new Tween(
        0,
        sprite.finalBounds.width / sprite.finalCumulativeTransform.a - this.prior.sprite.finalBounds.width,
        duration,
        this.opts.easing
      ).plus(this.prior.widthTween);
      this.heightTween = new Tween(
        0,
        sprite.finalBounds.height / sprite.finalCumulativeTransform.d - this.prior.sprite.finalBounds.height,
        duration,
        this.opts.easing
      ).plus(this.prior.heightTween);
    }

    while (!this.widthTween.done || !this.heightTween.done) {
      sprite.applyStyles({
        width:this.widthTween.currentValue,
        height: this.heightTween.currentValue
      });
      yield rAF();
    }
  }
}
