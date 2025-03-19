import { easeInAndOut } from '../easings/cosine.ts';
export interface TweenLike {
    currentValue: number;
    finalValue: number;
    done: boolean;
}
export default class Tween implements TweenLike {
    readonly initialValue: number;
    readonly finalValue: number;
    private curve;
    private diff;
    constructor(initialValue: number, finalValue: number, duration: number, easing?: typeof easeInAndOut);
    get currentValue(): number;
    get done(): boolean;
    plus(otherTween: TweenLike): DerivedTween;
}
export declare class DerivedTween implements TweenLike {
    private combinator;
    private _finalValue;
    private inputs;
    constructor(inputs: TweenLike[], combinator: (...inputs: TweenLike[]) => number);
    get finalValue(): number;
    get currentValue(): number;
    get done(): boolean;
}
//# sourceMappingURL=tween.d.ts.map