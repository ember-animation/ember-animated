import { Move, type MoveOptions } from './move.ts';
import type Sprite from '../-private/sprite.ts';
export default function follow(sprite: Sprite, opts?: Partial<FollowOptions>): Promise<any>;
interface FollowOptions extends MoveOptions {
    source: Move;
}
export declare class Follow extends Move<FollowOptions> {
    readonly source: Move;
    constructor(sprite: Sprite, opts?: Partial<MoveOptions>);
    animate(): Generator<Promise<unknown>, void, unknown>;
}
export {};
//# sourceMappingURL=follow.d.ts.map