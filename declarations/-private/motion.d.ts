import type Sprite from './sprite.ts';
export interface BaseOptions {
    duration: number;
}
export interface MotionConstructor<T extends BaseOptions = BaseOptions> {
    new (sprite: Sprite, opts: Partial<T>): Motion<T>;
}
export default abstract class Motion<T extends BaseOptions = BaseOptions> {
    readonly sprite: Sprite;
    readonly opts: Partial<T>;
    private _motionList;
    private _inheritedMotionList;
    constructor(sprite: Sprite, opts?: Partial<T>);
    get duration(): number;
    run(): Promise<any>;
    interrupted(_otherMotions: Motion[]): void;
    animate(): Generator<Promise<unknown>, void, unknown>;
    _run(): Generator<Promise<unknown>, void, unknown>;
    _setupMotionList(): void;
    _clearMotionList(): void;
}
//# sourceMappingURL=motion.d.ts.map