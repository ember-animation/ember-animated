import Ember from 'ember';
import Motion from '../motion';
import Tween from '../tween';
import { rAF } from '../concurrency-helpers';

export default class Opacity extends Motion {
  constructor(sprite, opts) {
    super(sprite, opts);
    this.prior = null;
    this.opacityTween = null;
    this.opacityFrom = null;
    this.opacityTo = null;
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
    let { sprite, duration, opacityFrom, opacityTo } = this;
    let computedOpacityFrom = opacityFrom != null ? opacityFrom : sprite.initialOpacity != null ? sprite.initialOpacity : 1;
    let computedOpacityTo = opacityTo != null ? opacityTo : sprite.finalOpacity != null ? sprite.finalOpacity : 1;
    let opacityTween = null;

    if (!this.prior) {
      this.opacityTween = opacityTween = new Tween(computedOpacityFrom, computedOpacityTo, duration);
    } else {
      let interruptedOpacity = this.prior.opacityTween.currentValue;
      this.opacityTween = opacityTween = new Tween(interruptedOpacity, computedOpacityTo, duration);
    }

    while (!opacityTween.done) {
      sprite.applyStyles({
        opacity: opacityTween.currentValue
      });
      yield rAF();
    }
  }
}

function _opacityClassHelper(opacityFrom, opacityTo) {
  return class extends Opacity {
    constructor(sprite, opts) {
      super(sprite, Ember.assign({}, opts, {
        from: opacityFrom,
        to: opacityTo
      }));
    }
  }
}

export const FadeIn = _opacityClassHelper(0, 1);
export const FadeOut = _opacityClassHelper(1, 0);
