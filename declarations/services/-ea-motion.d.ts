import type EmberObject from '@ember/object';
import Service from '@ember/service';
import type { Task } from '../-private/ember-scheduler.ts';
import type Sprite from '../-private/sprite.ts';
import type Child from '../-private/child';
import type { Transition } from '../-private/transition.ts';
interface Animator extends EmberObject {
    beginStaticMeasurement(): void;
    endStaticMeasurement(): void;
    isAnimating: boolean;
}
export type OrphanObserver = (removed: Sprite[], transition: Transition, duration: number, shouldAnimateRemoved: boolean) => void;
type AnimationObserver = (args: {
    task: Promise<void>;
    duration: number;
}) => void;
type AncestorObserver = (state: Child['state']) => void;
interface BaseComponentLike extends EmberObject {
    parentView: ComponentLike | undefined;
}
interface AnimatedListElement extends BaseComponentLike {
    isEmberAnimatedListElement: true;
    child: Child;
}
type ComponentLike = BaseComponentLike | AnimatedListElement;
interface Measurement {
    fn: () => void;
    resolved: boolean;
    value: any;
}
interface Rendezvous {
    inserted: Sprite[];
    kept: Sprite[];
    removed: Sprite[];
    matches: Map<Sprite, Sprite>;
    runAnimationTask: Promise<void>;
    otherTasks: Map<Promise<void>, true>;
}
export default class MotionService extends Service {
    _rendezvous: Rendezvous[];
    _measurements: Measurement[];
    _animators: import("@ember/array/-private/native-array").default<Animator>;
    _orphanObserver: OrphanObserver | null;
    _animationObservers: AnimationObserver[];
    _descendantObservers: {
        component: ComponentLike;
        fn: AnimationObserver;
    }[];
    _ancestorObservers: WeakMap<ComponentLike, Map<AncestorObserver, string>>;
    _beacons: {
        [name: string]: Sprite;
    } | null;
    register(animator: Animator): this;
    unregister(animator: Animator): this;
    observeOrphans(fn: OrphanObserver): this;
    unobserveOrphans(fn: OrphanObserver): this;
    observeAnimations(fn: AnimationObserver): this;
    unobserveAnimations(fn: AnimationObserver): this;
    observeDescendantAnimations(component: ComponentLike, fn: AnimationObserver): this;
    unobserveDescendantAnimations(component: ComponentLike, fn: AnimationObserver): this;
    observeAncestorAnimations(component: ComponentLike, fn: AncestorObserver): this;
    unobserveAncestorAnimations(component: ComponentLike, fn: AncestorObserver): this;
    get isAnimating(): boolean;
    get isAnimatingSync(): boolean;
    _invalidateIsAnimating: Task;
    waitUntilIdle: Task;
    matchDestroyed(removed: Sprite[], transition: Transition, duration: number, shouldAnimateRemoved: boolean): void;
    hasBeacon(name: string): Sprite | undefined;
    addBeacon: Task;
    farMatch: Task;
    willAnimate({ task, duration, component, children, }: {
        task: Promise<void>;
        duration: number;
        component: ComponentLike;
        children: Child[];
    }): void;
    staticMeasurement(fn: Measurement['fn']): Generator<Promise<void>, any, unknown>;
}
declare module '@ember/service' {
    interface Registry {
        '-ea-motion': MotionService;
    }
}
export {};
//# sourceMappingURL=-ea-motion.d.ts.map