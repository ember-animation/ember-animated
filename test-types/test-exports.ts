import {
  rAF,
  microwait,
  wait,
  afterRender,
  clock,
  allSettled,
  spawn,
  spawnChild,
  stop,
  current,
  childrenSettled,
  parallel,
  serial,
  task,
  printSprites,
  Motion,
  continueMotions,
  Tween,
  type Sprite,
  type TransitionContext,
  AnimatedBeacon,
  AnimatedContainer,
  animatedEach,
  animatedIf,
  AnimatedOrphans,
  animatedValue,
} from "ember-animated";

import { expectTypeOf } from "expect-type";
import type { ComponentLike } from "@glint/template";
import type { AnimatedEachSignature } from "ember-animated/components/animated-each";

/**
 * rAF
 */
expectTypeOf<typeof rAF>().toEqualTypeOf<() => Promise<unknown>>();

/**
 * microwait
 */
expectTypeOf<typeof microwait>().toEqualTypeOf<() => Promise<void>>();

/**
 * wait
 */
expectTypeOf<typeof wait>().toEqualTypeOf<(ms?: number) => Promise<void>>();

/**
 * afterRender
 */
expectTypeOf<typeof afterRender>().toEqualTypeOf<() => Promise<void>>();

/**
 * clock
 */
expectTypeOf<typeof clock>().toEqualTypeOf<{ now(): number }>();

/**
 * allSettled
 */
expectTypeOf<typeof allSettled>().toEqualTypeOf<
  (promises: Promise<any>[]) => Promise<any[]>
>();

/**
 * spawn
 */
expectTypeOf<typeof spawn>().toEqualTypeOf<
  (genFn: () => Generator) => Promise<any>
>();

/**
 * spawnChild
 */
expectTypeOf<typeof spawnChild>().toEqualTypeOf<
  (genFn: () => Generator) => Promise<any>
>();

/**
 * stop
 */
expectTypeOf<typeof stop>().toEqualTypeOf<
  (microRoutinePromise: Promise<any>) => void
>();

/**
 * current
 */
expectTypeOf<typeof current>().toEqualTypeOf<() => Promise<any> | undefined>();

/**
 * childrenSettled
 */
expectTypeOf<typeof childrenSettled>().toEqualTypeOf<() => Promise<any[]>>();

/**
 * parallel
 */
expectTypeOf<typeof parallel>().toEqualTypeOf<
  (
    ...functions: ((...args: any[]) => unknown)[]
  ) => (...args: any[]) => Promise<unknown[]>
>();

/**
 * serial
 */
expectTypeOf<typeof serial>().toEqualTypeOf<
  (
    ...functions: ((...args: any[]) => unknown)[]
  ) => (...args: any[]) => Promise<any>
>();

/**
 * task
 *
 * The return type intersects with `TaskProperty`, which is not exported from
 * the public entry point. Assert the parameter signature and that the return
 * value is callable as a class field decorator.
 */
expectTypeOf<typeof task>().parameter(0).toEqualTypeOf<
  (...args: any[]) => Generator
>();
expectTypeOf<ReturnType<typeof task>>().toMatchTypeOf<
  (proto: any, key: string) => any
>();

/**
 * printSprites
 *
 * Typed as `any` in the public declarations because the implementation
 * branches on a `DEBUG` flag and is assigned to an untyped `let`.
 */
expectTypeOf<typeof printSprites>().toEqualTypeOf<any>();

/**
 * Motion (abstract class)
 */
expectTypeOf<ConstructorParameters<typeof Motion>>().toEqualTypeOf<
  [Sprite, Partial<{ duration: number }>?]
>();
expectTypeOf<InstanceType<typeof Motion>>().toEqualTypeOf<Motion>();
expectTypeOf<Motion>().toHaveProperty("sprite").toEqualTypeOf<Sprite>();
expectTypeOf<Motion>().toHaveProperty("opts").toEqualTypeOf<
  Partial<{ duration: number }>
>();
expectTypeOf<Motion>().toHaveProperty("duration").toEqualTypeOf<number>();
expectTypeOf<Motion["run"]>().toEqualTypeOf<() => Promise<any>>();
expectTypeOf<Motion["interrupted"]>().toEqualTypeOf<
  (_otherMotions: Motion[]) => void
>();
expectTypeOf<Motion["animate"]>().toEqualTypeOf<
  () => Generator<Promise<unknown>, void, unknown>
>();

/**
 * continueMotions
 */
expectTypeOf<typeof continueMotions>().toEqualTypeOf<
  (oldElement: Element, newElement: Element) => void
>();

/**
 * Tween
 */
expectTypeOf<ConstructorParameters<typeof Tween>>().toEqualTypeOf<
  [number, number, number, ((t: number) => number)?]
>();
expectTypeOf<InstanceType<typeof Tween>>().toEqualTypeOf<Tween>();
expectTypeOf<Tween>().toHaveProperty("initialValue").toEqualTypeOf<number>();
expectTypeOf<Tween>().toHaveProperty("finalValue").toEqualTypeOf<number>();
expectTypeOf<Tween>().toHaveProperty("currentValue").toEqualTypeOf<number>();
expectTypeOf<Tween>().toHaveProperty("done").toEqualTypeOf<boolean>();
expectTypeOf<Tween["plus"]>().parameter(0).toEqualTypeOf<{
  currentValue: number;
  finalValue: number;
  done: boolean;
}>();

/**
 * Sprite (type-only export)
 */
expectTypeOf<Sprite>().toBeObject();
expectTypeOf<Sprite>().toHaveProperty("element");
expectTypeOf<Sprite>().toHaveProperty("initialBounds");
expectTypeOf<Sprite>().toHaveProperty("finalBounds");

/**
 * TransitionContext (type-only export)
 */
expectTypeOf<TransitionContext>().toBeObject();
expectTypeOf<TransitionContext>().toHaveProperty("duration").toEqualTypeOf<
  number
>();
expectTypeOf<TransitionContext>().toHaveProperty("insertedSprites");
expectTypeOf<TransitionContext>().toHaveProperty("keptSprites");
expectTypeOf<TransitionContext>().toHaveProperty("removedSprites");
expectTypeOf<TransitionContext>().toHaveProperty("sentSprites");
expectTypeOf<TransitionContext>().toHaveProperty("receivedSprites");
expectTypeOf<TransitionContext>().toHaveProperty("beacons");
expectTypeOf<TransitionContext["onMotionStart"]>().toEqualTypeOf<
  (sprite: Sprite) => void
>();
expectTypeOf<TransitionContext["onMotionEnd"]>().toEqualTypeOf<
  (sprite: Sprite) => void
>();

/**
 * AnimatedBeacon
 */
interface AnimatedBeaconSignature {
  Args: { name: string };
  Blocks: { default: [] };
}
expectTypeOf<typeof AnimatedBeacon>().toMatchTypeOf<
  ComponentLike<AnimatedBeaconSignature>
>();

/**
 * AnimatedContainer
 */
interface AnimatedContainerSignature<Tag extends string = "div"> {
  Element: HTMLDivElement;
  Args: {
    motion?: string;
    onInitialRender?: boolean;
    tag?: Tag;
    class?: string;
  };
  Blocks: { default: [] };
}
expectTypeOf<typeof AnimatedContainer>().toMatchTypeOf<
  ComponentLike<AnimatedContainerSignature>
>();

/**
 * animatedEach
 */
expectTypeOf<InstanceType<typeof animatedEach>>().toExtend<
  InstanceType<ComponentLike<AnimatedEachSignature<unknown>>>
>();

/**
 * animatedIf
 */
interface AnimatedIfSignature<T> {
  Args: {
    Positional: [T];
    Named: AnimatedEachSignature<[T]>["Args"]["Named"];
  };
  Blocks: {
    default: [];
    else: [];
  };
}
expectTypeOf<InstanceType<typeof animatedIf>>().toExtend<
  InstanceType<ComponentLike<AnimatedIfSignature<unknown>>>
>();

/**
 * AnimatedOrphans
 */
interface AnimatedOrphansSignature {
  Blocks: { default: [] };
}
expectTypeOf<typeof AnimatedOrphans>().toMatchTypeOf<
  ComponentLike<AnimatedOrphansSignature>
>();

/**
 * animatedValue
 */
interface AnimatedValueSignature<T> {
  Args: {
    Positional: [T];
    Named: AnimatedEachSignature<[T]>["Args"]["Named"];
  };
  Blocks: { default: [T] };
}
expectTypeOf<InstanceType<typeof animatedValue>>().toExtend<
  InstanceType<ComponentLike<AnimatedValueSignature<unknown>>>
>();
