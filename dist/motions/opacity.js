import { rAF } from '../-private/concurrency-helpers.js';
import Motion from '../-private/motion.js';
import Tween from '../-private/tween.js';
import linear from '../easings/linear.js';

function opacity(sprite, opts = {}) {
  return new Opacity(sprite, opts).run();
}

/**
  Animates in a sprite from 0% to 100% opacity.

  ```js
  for (let sprite of insertedSprites) {
    fadeIn(sprite)
  }
  ```

  @function fadeIn
  @param {Sprite} sprite
  @return {Motion}
*/
function fadeIn(sprite, opts = {}) {
  let innerOpts = Object.assign({
    to: 1
  }, opts);
  return opacity(sprite, innerOpts);
}

/**
  Animates out a sprite from 100% to 0% opacity.

  ```js
  for (let sprite of removedSprites) {
    fadeOut(sprite)
  }
  ```

  @function fadeOut
  @param {Sprite} sprite
  @return {Motion}
*/
function fadeOut(sprite, opts = {}) {
  let innerOpts = Object.assign({
    to: 0
  }, opts);
  return opacity(sprite, innerOpts);
}
class Opacity extends Motion {
  prior = null;
  tween = null;
  interrupted(motions) {
    // SAFTEY: We just checked the types
    this.prior = motions.find(m => m instanceof this.constructor);
  }

  /*
    This motion defines "duration" as the time it takes to go all the
    way from 0% to 100% (or 100% to 0%). So motions between values
    closer than that take proportionately less time.
  */
  *animate() {
    let {
      sprite,
      duration,
      opts
    } = this;
    let to = opts.to != null ? opts.to : sprite.finalComputedStyle != null ? parseFloat(sprite.finalComputedStyle.opacity) : 1;
    let from;
    if (this.prior) {
      let prior = this.prior;
      prior.assertHasTween();

      // when we're interrupting a prior opacity motion, we always
      // take its value as our starting point, regardless of whether
      // the user set a "from" option.
      from = prior.tween.currentValue;
    } else {
      // otherwise we start at the user-provided option, the sprite's
      // found initial opacity, or zero, in that priority order.
      from = opts.from != null ? opts.from : sprite.initialComputedStyle != null ? parseFloat(sprite.initialComputedStyle.opacity) : 0;
    }
    let proportionalDuration = Math.abs(from - to) * duration;
    this.tween = new Tween(from, to, proportionalDuration, this.opts.easing !== undefined ? this.opts.easing : linear);
    while (!this.tween.done) {
      sprite.applyStyles({
        opacity: `${this.tween.currentValue}`
      });
      yield rAF();
    }
  }
  assertHasTween() {
    if (!this.tween) {
      throw new Error(`motion does not have tween`);
    }
  }
}

export { Opacity, opacity as default, fadeIn, fadeOut };
//# sourceMappingURL=opacity.js.map
