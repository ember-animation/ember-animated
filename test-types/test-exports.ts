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

/**
 * rAF
 */
expectTypeOf<typeof rAF>().toEqualTypeOf<() => Promise<unknown>>();
