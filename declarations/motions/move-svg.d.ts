import Motion, { type BaseOptions } from '../-private/motion.ts';
import type Sprite from '../-private/sprite.ts';
import { type SVGPosition } from '../-private/sprite.ts';
import { type TweenLike } from '../-private/tween.ts';
declare function moveSVG(dimension: keyof SVGPosition, sprite: Sprite, opts?: Partial<MoveSVGOptions>): Promise<any>;
declare namespace moveSVG {
    var property: (propertyName: keyof SVGPosition) => (sprite: Sprite, opts?: Partial<MoveSVGOptions> | undefined) => Promise<any>;
}
export default moveSVG;
interface MoveSVGOptions extends BaseOptions {
    easing: (time: number) => number;
}
export declare class MoveSVG extends Motion<MoveSVGOptions> {
    readonly dimension: keyof SVGPosition;
    prior: MoveSVG | null | undefined;
    tween: TweenLike | null;
    constructor(dimension: keyof SVGPosition, sprite: Sprite, opts?: Partial<MoveSVGOptions>);
    interrupted(motions: Motion[]): void;
    animate(): Generator<Promise<unknown>, void, unknown>;
    assertHasTween(): asserts this is MoveSVGWithTween;
}
interface MoveSVGWithTween extends MoveSVG {
    tween: TweenLike;
}
//# sourceMappingURL=move-svg.d.ts.map