import Motion, { type BaseOptions } from '../-private/motion.ts';
import type Sprite from '../-private/sprite.ts';
import Tween from '../-private/tween.ts';
export default function compensateForScale(sprite: Sprite, opts?: Partial<BaseOptions>): Promise<any>;
export declare class CompensateForScale extends Motion {
    widthTween: Tween | null;
    heightTween: Tween | null;
    animate(): Generator<Promise<unknown>, void, unknown>;
}
//# sourceMappingURL=compensate-for-scale.d.ts.map