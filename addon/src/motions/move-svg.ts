import Motion, { type BaseOptions } from '../-private/motion';
import { type default as Sprite, type SVGPosition } from '../-private/sprite';
import Tween, { type TweenLike } from '../-private/tween';
import { rAF } from '../-private/concurrency-helpers';

export default function moveSVG(
  dimension: keyof SVGPosition,
  sprite: Sprite,
  opts: Partial<MoveSVGOptions> = {},
) {
  return new MoveSVG(dimension, sprite, opts).run();
}

moveSVG.property = function (propertyName: keyof SVGPosition) {
  return this.bind(null, propertyName);
};

interface MoveSVGOptions extends BaseOptions {
  easing: (time: number) => number;
}

export class MoveSVG extends Motion<MoveSVGOptions> {
  prior: MoveSVG | null | undefined = null;
  tween: TweenLike | null = null;

  constructor(
    readonly dimension: keyof SVGPosition,
    sprite: Sprite,
    opts: Partial<MoveSVGOptions> = {},
  ) {
    super(sprite, opts);
  }

  interrupted(motions: Motion[]) {
    this.prior = motions.find(
      (m) => m instanceof MoveSVG && m.dimension === this.dimension,
      // SAFETY: We just checked the type of this
    ) as MoveSVG | undefined;
  }

  *animate() {
    if (this.prior) {
      let prior: MoveSVG = this.prior;
      prior.assertHasTween();

      this.tween = new Tween(
        0,
        Number(this.sprite.getFinalDimension(this.dimension)) -
          prior.tween.finalValue,
        this.duration,
        this.opts.easing,
      ).plus(prior.tween);
    } else {
      this.tween = new Tween(
        Number(this.sprite.getInitialDimension(this.dimension)),
        Number(this.sprite.getFinalDimension(this.dimension)),
        this.duration,
        this.opts.easing,
      );
    }
    while (!this.tween.done) {
      // SAFETY: This is not very safe!
      (this.sprite.element as any)[this.dimension].baseVal.value =
        this.tween.currentValue;
      yield rAF();
    }
  }

  assertHasTween(): asserts this is MoveSVGWithTween {
    if (!this.tween) {
      throw new Error(`motion does not have tween`);
    }
  }
}

interface MoveSVGWithTween extends MoveSVG {
  tween: TweenLike;
}
