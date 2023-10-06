import type TransitionContext from './transition-context.ts';

export type Transition = (context: TransitionContext) => Generator;
