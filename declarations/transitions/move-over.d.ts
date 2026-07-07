import type TransitionContext from '../-private/transition-context.ts';
export declare const toLeft: (context: TransitionContext) => Generator<never, void, unknown>;
export declare const toRight: (context: TransitionContext) => Generator<never, void, unknown>;
export declare const toUp: (context: TransitionContext) => Generator<never, void, unknown>;
export declare const toDown: (context: TransitionContext) => Generator<never, void, unknown>;
export default function moveOver(dimension: string, direction: number, context: TransitionContext): Generator<never, void, unknown>;
//# sourceMappingURL=move-over.d.ts.map