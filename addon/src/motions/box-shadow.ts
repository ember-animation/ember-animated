import { BoxShadow, BoxShadowTween } from '../box-shadow.ts';
import Motion, { type BaseOptions } from '../-private/motion.ts';
import { rAF } from '../-private/concurrency-helpers.ts';
import type Sprite from '../-private/sprite.ts';

export default function boxShadow(
  sprite: Sprite,
  opts: Partial<BoxShadowMotionOptions> = {},
) {
  return new BoxShadowMotion(sprite, opts).run();
}

interface BoxShadowMotionOptions extends BaseOptions {
  from: string;
  to: string;
  easing: (time: number) => number;
}

export class BoxShadowMotion extends Motion<BoxShadowMotionOptions> {
  *animate() {
    let from;
    if (this.opts.from) {
      from = BoxShadow.fromUserProvidedShadow(this.opts.from);
    } else {
      this.sprite.assertHasInitialBounds();
      from = BoxShadow.fromComputedStyle(
        this.sprite.initialComputedStyle['box-shadow'],
      );
    }

    let to;
    if (this.opts.to) {
      to = BoxShadow.fromUserProvidedShadow(this.opts.to);
    } else {
      this.sprite.assertHasFinalBounds();
      to = BoxShadow.fromComputedStyle(
        this.sprite.finalComputedStyle['box-shadow'],
      );
    }

    let shadowTween = new BoxShadowTween(
      from,
      to,
      this.duration,
      this.opts.easing,
    );
    while (!shadowTween.done) {
      this.sprite.applyStyles({
        'box-shadow': shadowTween.currentValue
          .map((shadow) => shadow.toString())
          .join(','),
      });
      yield rAF();
    }
  }
}
