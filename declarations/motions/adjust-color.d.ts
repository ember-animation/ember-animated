import Motion, { type BaseOptions } from '../-private/motion.ts';
import type Sprite from '../-private/sprite.ts';
import { type CopiedCSS } from '../-private/sprite.ts';
import { ColorTween } from '../color.ts';
declare function adjustColor(propertyName: keyof CopiedCSS, sprite: Sprite, opts?: Partial<AdjustColorOptions>): Promise<any>;
declare namespace adjustColor {
    var property: (propertyName: keyof CopiedCSS) => (sprite: Sprite, opts?: Partial<AdjustColorOptions> | undefined) => Promise<any>;
}
export default adjustColor;
interface AdjustColorOptions extends BaseOptions {
    from: string;
    to: string;
    easing: (time: number) => number;
}
export declare class AdjustColor extends Motion<AdjustColorOptions> {
    readonly propertyName: keyof CopiedCSS;
    colorTween: ColorTween | null;
    constructor(propertyName: keyof CopiedCSS, sprite: Sprite, opts?: Partial<AdjustColorOptions>);
    animate(): Generator<Promise<unknown>, void, unknown>;
}
//# sourceMappingURL=adjust-color.d.ts.map