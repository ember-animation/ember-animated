import { rAF } from '../-private/concurrency-helpers.ts';
import Motion, { type BaseOptions } from '../-private/motion.ts';
import type Sprite from '../-private/sprite.ts';
import Tween, { type TweenLike } from '../-private/tween.ts';
import linear from '../easings/linear.ts';

export default function opacity(
  sprite: Sprite,
  opts: Partial<OpacityOptions> = {},
) {
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
export function fadeIn(sprite: Sprite, opts: Partial<OpacityOptions> = {}) {
  let innerOpts = Object.assign(
    {
      to: 1,
    },
    opts,
  );
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
export function fadeOut(sprite: Sprite, opts: Partial<OpacityOptions> = {}) {
  let innerOpts = Object.assign(
    {
      to: 0,
    },
    opts,
  );
  return opacity(sprite, innerOpts);
}

interface OpacityOptions extends BaseOptions {
  from: number;
  to: number;
  easing: (time: number) => number;
}

export class Opacity extends Motion<OpacityOptions> {
  prior: Opacity | null | undefined = null;
  tween: TweenLike | null = null;

  interrupted(motions: Motion[]) {
    // SAFTEY: We just checked the types
    this.prior = motions.find((m) => m instanceof this.constructor) as
      | Opacity
      | undefined;
  }

  /*
    This motion defines "duration" as the time it takes to go all the
    way from 0% to 100% (or 100% to 0%). So motions between values
    closer than that take proportionately less time.
  */
  *animate() {
    let { sprite, duration, opts } = this;
    let to =
      opts.to != null
        ? opts.to
        : sprite.finalComputedStyle != null
        ? parseFloat(sprite.finalComputedStyle.opacity)
        : 1;
    let from;

    if (this.prior) {
      let prior: Opacity = this.prior;
      prior.assertHasTween();

      // when we're interrupting a prior opacity motion, we always
      // take its value as our starting point, regardless of whether
      // the user set a "from" option.
      from = prior.tween.currentValue;
    } else {
      // otherwise we start at the user-provided option, the sprite's
      // found initial opacity, or zero, in that priority order.
      from =
        opts.from != null
          ? opts.from
          : sprite.initialComputedStyle != null
          ? parseFloat(sprite.initialComputedStyle.opacity)
          : 0;
    }

    let proportionalDuration = Math.abs(from - to) * duration;
    this.tween = new Tween(
      from,
      to,
      proportionalDuration,
      this.opts.easing !== undefined ? this.opts.easing : linear,
    );

    while (!this.tween.done) {
      sprite.applyStyles({
        opacity: `${this.tween.currentValue}`,
      });
      yield rAF();
    }
  }

  assertHasTween(): asserts this is OpacityWithTween {
    if (!this.tween) {
      throw new Error(`motion does not have tween`);
    }
  }
}

interface OpacityWithTween extends Opacity {
  tween: TweenLike;
}
