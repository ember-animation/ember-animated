import Motion, { BaseOptions } from '../-private/motion';
import Tween, { TweenLike } from '../-private/tween';
import { rAF } from '../-private/concurrency-helpers';
import Sprite, { CopiedCSS } from '../-private/sprite';

/**
  Animates the change in style of a Sprite. Applies to CSS properties that are a unit and a number (font-size, letter spacing, etc.).

  @function adjustCSS
  @export default
  @param {String} propertyName The CSS property to adjust
  @param {Sprite} sprite The sprite we're adjusting
  @param {Object} options
  @return {Motion}
*/
export default function adjustCSS(
  propertyName: keyof CopiedCSS,
  sprite: Sprite,
  opts: Partial<AdjustCSSOptions> = {},
) {
  return new AdjustCSS(propertyName, sprite, opts).run();
}

adjustCSS.property = function (propertyName: keyof CopiedCSS) {
  return this.bind(null, propertyName);
};

interface AdjustCSSOptions extends BaseOptions {
  easing: (time: number) => number;
}

export class AdjustCSS extends Motion<AdjustCSSOptions> {
  prior: AdjustCSS | null | undefined = null;
  tween: TweenLike | null = null;

  constructor(
    readonly propertyName: keyof CopiedCSS,
    sprite: Sprite,
    opts: Partial<AdjustCSSOptions> = {},
  ) {
    super(sprite, opts);
  }

  interrupted(motions: Motion[]) {
    this.prior = motions.find(
      (m) => m instanceof AdjustCSS && m.propertyName === this.propertyName,
      // SAFETY: We just checked that it's an instance of AdjustCSS
    ) as AdjustCSS | undefined;
  }

  *animate() {
    let { value: finalValue, unit } = this._splitUnit(
      this.sprite.finalComputedStyle![this.propertyName],
    );
    if (this.prior) {
      let prior: AdjustCSS = this.prior;
      prior.assertHasTween();

      this.tween = new Tween(
        0,
        finalValue - prior.tween.finalValue,
        this.duration,
        this.opts.easing,
      ).plus(prior.tween);
    } else {
      this.sprite.assertHasInitialBounds();
      this.tween = new Tween(
        this._splitUnit(
          this.sprite.initialComputedStyle[this.propertyName],
        ).value,
        finalValue,
        this.duration,
        this.opts.easing,
      );
    }
    while (!this.tween.done) {
      this.sprite.applyStyles({
        [this.propertyName]: `${this.tween.currentValue}${unit}`,
      });
      yield rAF();
    }
  }

  _splitUnit(s: string) {
    if (this.propertyName === 'letter-spacing' && s === 'normal') {
      return {
        value: 0,
        unit: 'px',
      };
    }
    let m = /(\d+(?:\.\d+)?)(\w+)/.exec(s);
    if (!m) {
      throw new Error(
        `Unable to use adjustCSS for property ${this.propertyName} which has value ${s}`,
      );
    }
    return {
      value: parseFloat(m[1]),
      unit: m[2] || '',
    };
  }

  assertHasTween(): asserts this is AdjustCSSWithTween {
    if (!this.tween) {
      throw new Error(`motion does not have tween`);
    }
  }
}

interface AdjustCSSWithTween extends AdjustCSS {
  tween: TweenLike;
}
