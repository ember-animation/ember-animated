import Motion, { type BaseOptions } from '../-private/motion.ts';
import { type TweenLike } from '../-private/tween.ts';
import type Sprite from '../-private/sprite.ts';
import { type CopiedCSS } from '../-private/sprite.ts';
/**
  Animates the change in style of a Sprite. Applies to CSS properties that are a unit and a number (font-size, letter spacing, etc.).

  @function adjustCSS
  @export default
  @param {String} propertyName The CSS property to adjust
  @param {Sprite} sprite The sprite we're adjusting
  @param {Object} options
  @return {Motion}
*/
declare function adjustCSS(propertyName: keyof CopiedCSS, sprite: Sprite, opts?: Partial<AdjustCSSOptions>): Promise<any>;
declare namespace adjustCSS {
    var property: (propertyName: keyof CopiedCSS) => (sprite: Sprite, opts?: Partial<AdjustCSSOptions> | undefined) => Promise<any>;
}
export default adjustCSS;
interface AdjustCSSOptions extends BaseOptions {
    easing: (time: number) => number;
}
export declare class AdjustCSS extends Motion<AdjustCSSOptions> {
    readonly propertyName: keyof CopiedCSS;
    prior: AdjustCSS | null | undefined;
    tween: TweenLike | null;
    constructor(propertyName: keyof CopiedCSS, sprite: Sprite, opts?: Partial<AdjustCSSOptions>);
    interrupted(motions: Motion[]): void;
    animate(): Generator<Promise<unknown>, void, unknown>;
    _splitUnit(s: string): {
        value: number;
        unit: string;
    };
    assertHasTween(): asserts this is AdjustCSSWithTween;
}
interface AdjustCSSWithTween extends AdjustCSS {
    tween: TweenLike;
}
//# sourceMappingURL=adjust-css.d.ts.map