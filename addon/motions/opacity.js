import Ember from 'ember';
import Motion from '../motion';
import Tween from '../tween';
import { rAF } from '../concurrency-helpers';

export default class Opacity extends Motion {
  constructor(sprite, opts) {
    super(sprite, opts);
    this.prior = null;
    this.opacityTween = null;
    this.opacityFrom = 0;
    this.opacityTo = 1;
    if (opts && opts.duration != null) {
      this.duration = opts.duration;
    }
    if (opts && opts.from != null) {
      this.opacityFrom = opts.from;
    }
    if (opts && opts.to != null) {
      this.opacityTo = opts.to;
    }
  }

  interrupted(motions) {
    this.prior = motions.find(m => m instanceof this.constructor);
  }

  * animate() {
    let { sprite, duration } = this;

    if (!this.prior) {
      this.opacityTween = new Tween(this.opacityFrom, this.opacityTo, duration);
    } else {
      let interruptedOpacity = this.prior.opacityTween.currentValue;
      this.opacityTween = new Tween(interruptedOpacity, this.opacityTo, duration);
    }

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

export class FadeOut extends Opacity {
  constructor(sprite, opts) {
    super(sprite, Ember.assign({}, opts, {
      from: 1,
      to: 0
    }));
  }
}

export const FadeIn = Opacity;
