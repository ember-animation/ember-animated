import * as emberService from '@ember/service';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { task, type Task } from '../-private/ember-scheduler.ts';
import { afterRender, microwait } from '../-private/concurrency-helpers.ts';
import { continueMotions } from '../-private/motion-bridge.ts';
import TransitionContext, {
  runToCompletion,
} from '../-private/transition-context.ts';
import { spawnChild, childrenSettled, current } from '../-private/scheduler.ts';
import Sprite from '../-private/sprite.ts';
import partition from '../-private/partition.ts';
import '../element-remove.ts';
import type MotionService from '../services/-ea-motion.ts';
import type { Transition } from '../-private/transition.ts';
const service = emberService.service ?? emberService.inject;

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
  // eslint-disable-next-line ember/classic-decorator-hooks
  init(...args: []): void {
    super.init(...args);

    this.classNames = this.classNames.concat(['animated-orphans']);
  }

  @service('-ea-motion')
  motionService!: MotionService;

  private _newOrphanTransitions = [] as {
    removedSprites: Sprite[];
    transition: Transition;
    duration: number;
    shouldAnimateRemoved: boolean;
  }[];
  private _elementToChild = new WeakMap();
  private _childToTransition = new WeakMap();
  private _inserted = false;
  private _cycleCounter = 0;

  didInsertElement() {
    super.didInsertElement();
    this._inserted = true;
    this.motionService
      .register(this as any)
      .observeOrphans(this.animateOrphans)
      .observeAnimations(this.reanimate);
  }

  willDestroyElement() {
    super.willDestroyElement();
    this.motionService
      .unregister(this as any)
      .unobserveOrphans(this.animateOrphans)
      .unobserveAnimations(this.reanimate);
  }

  @action
  animateOrphans(
    removedSprites: Sprite[],
    transition: Transition,
    duration: number,
    shouldAnimateRemoved: boolean,
  ) {
    this._newOrphanTransitions.push({
      removedSprites: removedSprites.map((sprite: Sprite) => {
        // we clone the owner objects so that our sprite garbage
        // collection is entirely detached from the original
        // animator's
        sprite.assertHasOwner();
        sprite.owner = sprite.owner.clone();
        sprite.owner.flagForRemoval();
        return sprite;
      }),
      transition,
      duration,
      shouldAnimateRemoved,
    });
    this.reanimate();
  }

  @action
  reanimate() {
    if (!this.get('startAnimation.isRunning' as any)) {
      let ownSprite = new Sprite(
        this.element as HTMLElement | SVGElement,
        true,
        null,
        null,
      );
      let activeSprites = this._findActiveSprites(ownSprite);
      this.animate.perform({ ownSprite, activeSprites });
    }
  }

  beginStaticMeasurement() {
    // we don't have any impact on static layout
  }

  endStaticMeasurement() {}

  @alias('animate.isRunning')
  isAnimating!: boolean;

  @(task(function* (this: AnimatedOrphans, { ownSprite, activeSprites }) {
    yield this.startAnimation.perform(ownSprite);
    let { matchingAnimatorsFinished } = (yield this.runAnimation.perform(
      activeSprites,
      ownSprite,
    )) as { matchingAnimatorsFinished: Promise<void> };
    yield this.finalizeAnimation.perform(
      activeSprites,
      matchingAnimatorsFinished,
    );
  }).restartable())
  animate!: Task;

  @task(function* (this: AnimatedOrphans, ownSprite) {
    yield afterRender();
    ownSprite.measureFinalBounds();
  })
  startAnimation!: Task;

  @task(function* (this: AnimatedOrphans, activeSprites, ownSprite) {
    // we don't need any static measurements, but we wait for this so
    // we stay on the same timing as all the other animators
    yield* this.motionService.staticMeasurement(() => {});

    // Some of the new orphan transitions may be handing us sprites we
    // already have matches for, in which case our active sprites take
    // precedence.
    {
      let activeIds = Object.create(null);
      for (let sprite of activeSprites) {
        activeIds[`${sprite.owner.group}/${sprite.owner.id}`] = true;
      }
      for (let entry of this._newOrphanTransitions) {
        entry.removedSprites = entry.removedSprites.filter((s: Sprite) => {
          s.assertHasOwner();
          return !activeIds[`${s.owner.group}/${s.owner.id}`];
        });
      }
    }

    // our sprites from prior animation runs are eligible to be
    // matched by other animators (this is how an orphan sprites that
    // are animating away can get interrupted into coming back)
    let { farMatches, matchingAnimatorsFinished } = (yield this.motionService
      .get('farMatch')
      .perform(
        current(),
        [],
        [],
        activeSprites.concat(
          ...this._newOrphanTransitions.map((t) => t.removedSprites),
        ),
      )) as {
      matchingAnimatorsFinished: Promise<void>;
      farMatches: Map<Sprite, Sprite>;
    };

    let cycle = this._cycleCounter++;

    for (let { transition, duration, sprites } of this._groupActiveSprites(
      activeSprites,
    )) {
      let [sentSprites, removedSprites] = partition(sprites, (sprite) => {
        let other = farMatches.get(sprite);
        if (other) {
          sprite.endAtSprite(other);
          if (other.revealed && !sprite.revealed) {
            sprite.startAtSprite(other);
          }
          return true;
        }
        return false;
      });
      let context = new TransitionContext(
        duration,
        [],
        [],
        removedSprites,
        sentSprites,
        [],
        {},
        this._onMotionStart.bind(this, cycle),
        this._onMotionEnd.bind(this, cycle),
      );
      spawnChild(function* () {
        // let other animators make their own partitioning decisions
        // before we start hiding the sent & received sprites
        yield microwait();
        sentSprites.forEach((s) => s.hide());
        yield* runToCompletion(context, transition);
      });
    }

    while (this._newOrphanTransitions.length > 0) {
      // This is a pop instead of a shift because we want to start the
      // animations in the reverse order that they were
      // scheduled. This is a consequence of Ember's
      // willDestroyElement firing from top to bottom. We want
      // descendants have a chance to start before their ancestors,
      // because each one is going to potentially trigger DOM cloning,
      // so any animated descendants need to get hidden before one of
      // their ancestors clones them.
      let entry = this._newOrphanTransitions.pop()!;
      let { transition, duration, removedSprites, shouldAnimateRemoved } =
        entry;

      if (removedSprites.length === 0) {
        // This can happen due to our filtering based on activeIds
        // above: some new orphan transitions may have nothing new
        // that we aren't already animating.
        continue;
      }

      for (let _sprite of removedSprites) {
        // typesecript workaround for https://github.com/microsoft/TypeScript/issues/35940
        let sprite: Sprite = _sprite;
        sprite.assertHasOwner();
        sprite.rehome(ownSprite);
        this._childToTransition.set(sprite.owner, entry);
      }

      let [sentSprites, unmatchedRemovedSprites] = partition(
        removedSprites,
        (sprite) => {
          let other = farMatches.get(sprite);
          if (other) {
            sprite.endAtSprite(other);
            if (other.revealed && !sprite.revealed) {
              sprite.startAtSprite(other);
            }
            return true;
          }
          return false;
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let self = this;
      spawnChild(function* () {
        yield microwait();
        sentSprites.forEach((s) => s.hide());

        // now that we've hidden any sent sprites, we can bail out
        // early if there is no transition they want to run
        if (!transition) {
          return;
        }

        let removedSprites: Sprite[];
        if (shouldAnimateRemoved) {
          removedSprites = unmatchedRemovedSprites;
        } else {
          removedSprites = [];
        }

        // Early bail out if there's nothing left that could animate
        if (removedSprites.length === 0 && sentSprites.length === 0) {
          return;
        }

        let context = new TransitionContext(
          duration,
          [],
          [],
          removedSprites,
          sentSprites,
          [],
          {},
          self._onFirstMotionStart.bind(self, activeSprites, cycle),
          self._onMotionEnd.bind(self, cycle),
        );
        context.prepareSprite = self._prepareSprite.bind(self);

        yield* runToCompletion(context, transition);
      });
    }

    yield childrenSettled();
    return { matchingAnimatorsFinished };
  })
  runAnimation!: Task;

  @task(function* (activeSprites, matchingAnimatorsFinished) {
    yield matchingAnimatorsFinished;
    for (let sprite of activeSprites) {
      sprite.element.remove();
    }
  })
  finalizeAnimation!: Task;

  _findActiveSprites(ownSprite: Sprite) {
    if (!this._inserted) {
      return [];
    }
    return Array.from(this.element.children)
      .map((element) => {
        let child = this._elementToChild.get(element);
        if (child.shouldRemove) {
          // child was not animating in the previously interrupted
          // animation, so its safe to remove
          element.remove();
          return undefined;
        } else {
          let sprite = Sprite.positionedStartingAt(
            element as HTMLElement | SVGElement,
            ownSprite,
          );
          sprite.owner = child;
          // we need to flag each existing child for removal at the
          // start of each animation. That's what reinitializes its
          // removal blockers count.
          child.flagForRemoval();
          return sprite;
        }
      })
      .filter(Boolean);
  }

  _groupActiveSprites(
    activeSprites: Sprite[],
  ): { transition: Transition; duration: number; sprites: Sprite[] }[] {
    let groups = [] as ReturnType<AnimatedOrphans['_groupActiveSprites']>;
    for (let _sprite of activeSprites) {
      // ts workaround for https://github.com/microsoft/TypeScript/issues/35940
      let sprite: Sprite = _sprite;
      sprite.assertHasOwner();
      let { transition, duration } = this._childToTransition.get(sprite.owner);
      let group = groups.find((g) => g.transition === transition);
      if (!group) {
        group = { transition, duration, sprites: [] };
        groups.push(group);
      }
      group.sprites.push(sprite);
    }
    return groups;
  }

  _prepareSprite(sprite: Sprite) {
    sprite.hide();
    let newElement = sprite.element.cloneNode(true) as HTMLElement | SVGElement;
    continueMotions(sprite.element, newElement);
    sprite.element = newElement;
    return sprite;
  }

  _onFirstMotionStart(activeSprites: Sprite[], cycle: number, sprite: Sprite) {
    if (activeSprites.indexOf(sprite) === -1) {
      // in most animators, sprites are still living in their normal place in
      // the DOM, and so they will necessarily start out with their appearance
      // matching initialComputedStyles. But here we're dealing with an orphan
      // who may have lost inherited styles. So we manually re-apply the
      // initialComputedStyles that were snapshotted before it was moved. See
      // COPIED_CSS_PROPERTIES to see exactly which property we copy (we don't
      // do all of them, that sounds expensive).
      //
      // Also, unfortunately getComputedStyles has legacy behavior for
      // line-height that gives us the "used value" not the "computed value".
      // The used value doesn't inherit correctly, so we can't set it here, so
      // we're pulling that one out.
      let s: Record<string, any> = Object.assign(
        {},
        sprite.initialComputedStyle,
      );
      delete s['line-height'];
      sprite.applyStyles(s);

      this.element.appendChild(sprite.element);
      sprite.lock();
      sprite.reveal();
      activeSprites.push(sprite);
      this._elementToChild.set(sprite.element, sprite.owner);
    }
    sprite.assertHasOwner();
    sprite.owner.block(cycle);
  }

  _onMotionStart(cycle: number, sprite: Sprite) {
    sprite.assertHasOwner();
    sprite.reveal();
    sprite.owner.block(cycle);
  }

  _onMotionEnd(cycle: number, sprite: Sprite) {
    sprite.assertHasOwner();
    sprite.owner.unblock(cycle);
  }

  <template>
    {{! template-lint-disable no-yield-only }}
    {{yield}}
  </template>
}
