import type TransitionContext from './transition-context';

export type Transition = (context: TransitionContext) => Generator;
