import Motion, { type BaseOptions } from '../-private/motion.ts';
import type Sprite from '../-private/sprite.ts';
export default function boxShadow(sprite: Sprite, opts?: Partial<BoxShadowMotionOptions>): Promise<any>;
interface BoxShadowMotionOptions extends BaseOptions {
    from: string;
    to: string;
    easing: (time: number) => number;
}
export declare class BoxShadowMotion extends Motion<BoxShadowMotionOptions> {
    animate(): Generator<Promise<unknown>, void, unknown>;
}
export {};
//# sourceMappingURL=box-shadow.d.ts.map