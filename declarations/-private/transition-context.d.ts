import type Sprite from './sprite.ts';
import type { Transition } from './transition.ts';
export declare function runToCompletion(context: TransitionContext, transition: Transition): Generator<unknown, void, unknown>;
export default class TransitionContext {
    private _duration;
    private _insertedSprites;
    private _keptSprites;
    private _removedSprites;
    private _sentSprites;
    private _receivedSprites;
    private _beacons;
    readonly onMotionStart: (sprite: Sprite) => void;
    readonly onMotionEnd: (sprite: Sprite) => void;
    static forSprite(sprite: Sprite): TransitionContext;
    private _prepared;
    prepareSprite: ((sprite: Sprite) => Sprite) | undefined;
    constructor(_duration: number, _insertedSprites: Sprite[], _keptSprites: Sprite[], _removedSprites: Sprite[], _sentSprites: Sprite[], _receivedSprites: Sprite[], _beacons: {
        [name: string]: Sprite;
    }, onMotionStart: (sprite: Sprite) => void, onMotionEnd: (sprite: Sprite) => void);
    get duration(): number;
    get insertedSprites(): Sprite[];
    get keptSprites(): Sprite[];
    get removedSprites(): Sprite[];
    get sentSprites(): Sprite[];
    get receivedSprites(): Sprite[];
    get beacons(): {
        [name: string]: Sprite;
    };
    private _prepareSprites;
}
//# sourceMappingURL=transition-context.d.ts.map