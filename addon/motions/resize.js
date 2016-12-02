import Motion from '../motion';
import Tween from '../tween';
import { rAF } from '../concurrency-helpers';

export default class Resize extends Motion {
  constructor(sprite, opts) {
    super(sprite, opts);
    this.prior = null;
    this.widthTween = null;
    this.heightTween = null;
  }

  interrupted(motions) {
    this.prior = motions.find(m => m instanceof this.constructor);
  }

  async animate() {
    let sprite = this.sprite;
    let element = sprite.element;
    let duration = this.opts.duration;
    if (this.opts.duration == null) {
      duration = 2000;
    }

    if (!this.prior) {
      this.widthTween = new Tween(sprite.initialBounds.width, sprite.finalBounds.width, duration);
      this.heightTween = new Tween(sprite.initialBounds.height, sprite.finalBounds.height, duration);
    } else {
      this.widthTween = new Tween(
        0,
        sprite.finalBounds.width - this.prior.sprite.finalBounds.width,
        duration
      ).plus(this.prior.widthTween);
      this.heightTween = new Tween(
        0,
        sprite.finalBounds.height - this.prior.sprite.finalBounds.height,
        duration
      ).plus(this.prior.heightTween);
    }

    while (!this.widthTween.done) {
      await rAF();
      element.style.width = this.widthTween.currentValue + 'px';
      element.style.height = this.heightTween.currentValue + 'px';
    }
  }
}
