import { assign } from '@ember/polyfills';
import { Motion, rAF, Tween } from '..';
import linear from '../easings/linear';

export default function opacity(sprite, opts) {
  return new Opacity(sprite, opts).run();
}

export class Opacity extends Motion {
  constructor(sprite, opts) {
    super(sprite, opts);
    this.prior = null;
    this.tween = null;
  }

  interrupted(motions) {
    this.prior = motions.find(m => m instanceof this.constructor);
  }

  /*
    This motion defines "duration" as the time it takes to go all the
    way from 0% to 100% (or 100% to 0%). So motions between values
    closer than that take proportionately less time.
  */
  * animate() {
    let { sprite, duration, opts } = this;
    let to = opts.to != null ? opts.to : sprite.finalOpacity != null ? sprite.finalOpacity : 1;
    let from;

    if (this.prior) {
      // when we're interrupting a prior opacity motion, we always
      // take its value as our starting point, regardless of whether
      // the user set a "from" option.
      from = this.prior.tween.currentValue;
    } else {
      // otherwise we start at the user-provided option, the sprite's
      // found initial opacity, or zero, in that priority order.
      from = opts.from != null ? opts.from : sprite.initialOpacity != null ? sprite.initialOpacity : 0;
    }

    let proportionalDuration = Math.abs(from - to) * duration;
    this.tween = new Tween(from, to, proportionalDuration, linear);

    while (!this.tween.done) {
      sprite.applyStyles({
        opacity: this.tween.currentValue
      });
      yield rAF();
    }
  }
}

function _opacityClassHelper(opacityFrom, opacityTo) {
  return class extends Opacity {
    constructor(sprite, opts) {
      super(sprite, assign({}, opts, {
        from: opacityFrom,
        to: opacityTo
      }));
    }
  };
}

export const FadeIn = _opacityClassHelper(0, 1);
export const FadeOut = _opacityClassHelper(1, 0);
