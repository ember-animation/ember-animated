import Component from '@ember/component';
import { type Task } from '../-private/ember-scheduler.ts';
import Sprite from '../-private/sprite.ts';
import '../element-remove.ts';
import type MotionService from '../services/-ea-motion.ts';
import type { Transition } from '../-private/transition.ts';
interface AnimatedOrphansSignature {
    Blocks: {
        default: [];
    };
}
/**
  A component that adopts any orphaned sprites so they can continue animating even
  after their original parent component has been destroyed. This relies on cloning
  DOM nodes, and the cloned nodes will be inserted as children of animated-orphans.

  ```hbs
  <AnimatedOrphans/>
  ```
  @class animated-orphans
  @public
*/
export default class AnimatedOrphans extends Component<AnimatedOrphansSignature> {
    classNames: string[];
    motionService: MotionService;
    private _newOrphanTransitions;
    private _elementToChild;
    private _childToTransition;
    private _inserted;
    private _cycleCounter;
    didInsertElement(): void;
    willDestroyElement(): void;
    animateOrphans(removedSprites: Sprite[], transition: Transition, duration: number, shouldAnimateRemoved: boolean): void;
    reanimate(): void;
    beginStaticMeasurement(): void;
    endStaticMeasurement(): void;
    isAnimating: boolean;
    animate: Task;
    startAnimation: Task;
    runAnimation: Task;
    finalizeAnimation: Task;
    _findActiveSprites(ownSprite: Sprite): (Sprite | undefined)[];
    _groupActiveSprites(activeSprites: Sprite[]): {
        transition: Transition;
        duration: number;
        sprites: Sprite[];
    }[];
    _prepareSprite(sprite: Sprite): Sprite;
    _onFirstMotionStart(activeSprites: Sprite[], cycle: number, sprite: Sprite): void;
    _onMotionStart(cycle: number, sprite: Sprite): void;
    _onMotionEnd(cycle: number, sprite: Sprite): void;
}
export {};
//# sourceMappingURL=animated-orphans.d.ts.map