import { inject } from '@ember/service';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import Component, { setComponentTemplate } from '@ember/component';
import { task } from '../-private/ember-scheduler.js';
import { afterRender, microwait } from '../-private/concurrency-helpers.js';
import { continueMotions } from '../-private/motion-bridge.js';
import TransitionContext, { runToCompletion } from '../-private/transition-context.js';
import { current, spawnChild, childrenSettled } from '../-private/scheduler.js';
import Sprite from '../-private/sprite.js';
import partition from '../-private/partition.js';
import '../element-remove-8rRE7jKB.js';
import { precompileTemplate } from '@ember/template-compilation';
import { g, i, n } from 'decorator-transforms/runtime';

var TEMPLATE = precompileTemplate("{{! template-lint-disable no-yield-only }}\n{{yield}}");

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
class AnimatedOrphans extends Component {
  classNames = this.classNames.concat('animated-orphans');
  static {
    g(this.prototype, "motionService", [inject('-ea-motion')]);
  }
  #motionService = (i(this, "motionService"), void 0);
  _newOrphanTransitions = [];
  _elementToChild = new WeakMap();
  _childToTransition = new WeakMap();
  _inserted = false;
  _cycleCounter = 0;
  didInsertElement() {
    super.didInsertElement();
    this._inserted = true;
    this.motionService.register(this).observeOrphans(this.animateOrphans).observeAnimations(this.reanimate);
  }
  willDestroyElement() {
    super.willDestroyElement();
    this.motionService.unregister(this).unobserveOrphans(this.animateOrphans).unobserveAnimations(this.reanimate);
  }
  animateOrphans(removedSprites, transition, duration, shouldAnimateRemoved) {
    this._newOrphanTransitions.push({
      removedSprites: removedSprites.map(sprite => {
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
      shouldAnimateRemoved
    });
    this.reanimate();
  }
  static {
    n(this.prototype, "animateOrphans", [action]);
  }
  reanimate() {
    if (!this.get('startAnimation.isRunning')) {
      let ownSprite = new Sprite(this.element, true, null, null);
      let activeSprites = this._findActiveSprites(ownSprite);
      this.animate.perform({
        ownSprite,
        activeSprites
      });
    }
  }
  static {
    n(this.prototype, "reanimate", [action]);
  }
  beginStaticMeasurement() {
    // we don't have any impact on static layout
  }
  endStaticMeasurement() {}
  static {
    g(this.prototype, "isAnimating", [alias('animate.isRunning')]);
  }
  #isAnimating = (i(this, "isAnimating"), void 0);
  static {
    g(this.prototype, "animate", [task(function* ({
      ownSprite,
      activeSprites
    }) {
      yield this.startAnimation.perform(ownSprite);
      let {
        matchingAnimatorsFinished
      } = yield this.runAnimation.perform(activeSprites, ownSprite);
      yield this.finalizeAnimation.perform(activeSprites, matchingAnimatorsFinished);
    }).restartable()]);
  }
  #animate = (i(this, "animate"), void 0);
  static {
    g(this.prototype, "startAnimation", [task(function* (ownSprite) {
      yield afterRender();
      ownSprite.measureFinalBounds();
    })]);
  }
  #startAnimation = (i(this, "startAnimation"), void 0);
  static {
    g(this.prototype, "runAnimation", [task(function* (activeSprites, ownSprite) {
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
          entry.removedSprites = entry.removedSprites.filter(s => {
            s.assertHasOwner();
            return !activeIds[`${s.owner.group}/${s.owner.id}`];
          });
        }
      }

      // our sprites from prior animation runs are eligible to be
      // matched by other animators (this is how an orphan sprites that
      // are animating away can get interrupted into coming back)
      let {
        farMatches,
        matchingAnimatorsFinished
      } = yield this.motionService.get('farMatch').perform(current(), [], [], activeSprites.concat(...this._newOrphanTransitions.map(t => t.removedSprites)));
      let cycle = this._cycleCounter++;
      for (let {
        transition,
        duration,
        sprites
      } of this._groupActiveSprites(activeSprites)) {
        let [sentSprites, removedSprites] = partition(sprites, sprite => {
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
        let context = new TransitionContext(duration, [], [], removedSprites, sentSprites, [], {}, this._onMotionStart.bind(this, cycle), this._onMotionEnd.bind(this, cycle));
        spawnChild(function* () {
          // let other animators make their own partitioning decisions
          // before we start hiding the sent & received sprites
          yield microwait();
          sentSprites.forEach(s => s.hide());
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
        let entry = this._newOrphanTransitions.pop();
        let {
          transition,
          duration,
          removedSprites,
          shouldAnimateRemoved
        } = entry;
        if (removedSprites.length === 0) {
          // This can happen due to our filtering based on activeIds
          // above: some new orphan transitions may have nothing new
          // that we aren't already animating.
          continue;
        }
        for (let _sprite of removedSprites) {
          // typesecript workaround for https://github.com/microsoft/TypeScript/issues/35940
          let sprite = _sprite;
          sprite.assertHasOwner();
          sprite.rehome(ownSprite);
          this._childToTransition.set(sprite.owner, entry);
        }
        let [sentSprites, unmatchedRemovedSprites] = partition(removedSprites, sprite => {
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

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let self = this;
        spawnChild(function* () {
          yield microwait();
          sentSprites.forEach(s => s.hide());

          // now that we've hidden any sent sprites, we can bail out
          // early if there is no transition they want to run
          if (!transition) {
            return;
          }
          let removedSprites;
          if (shouldAnimateRemoved) {
            removedSprites = unmatchedRemovedSprites;
          } else {
            removedSprites = [];
          }

          // Early bail out if there's nothing left that could animate
          if (removedSprites.length === 0 && sentSprites.length === 0) {
            return;
          }
          let context = new TransitionContext(duration, [], [], removedSprites, sentSprites, [], {}, self._onFirstMotionStart.bind(self, activeSprites, cycle), self._onMotionEnd.bind(self, cycle));
          context.prepareSprite = self._prepareSprite.bind(self);
          yield* runToCompletion(context, transition);
        });
      }
      yield childrenSettled();
      return {
        matchingAnimatorsFinished
      };
    })]);
  }
  #runAnimation = (i(this, "runAnimation"), void 0);
  static {
    g(this.prototype, "finalizeAnimation", [task(function* (activeSprites, matchingAnimatorsFinished) {
      yield matchingAnimatorsFinished;
      for (let sprite of activeSprites) {
        sprite.element.remove();
      }
    })]);
  }
  #finalizeAnimation = (i(this, "finalizeAnimation"), void 0);
  _findActiveSprites(ownSprite) {
    if (!this._inserted) {
      return [];
    }
    return Array.from(this.element.children).map(element => {
      let child = this._elementToChild.get(element);
      if (child.shouldRemove) {
        // child was not animating in the previously interrupted
        // animation, so its safe to remove
        element.remove();
        return undefined;
      } else {
        let sprite = Sprite.positionedStartingAt(element, ownSprite);
        sprite.owner = child;
        // we need to flag each existing child for removal at the
        // start of each animation. That's what reinitializes its
        // removal blockers count.
        child.flagForRemoval();
        return sprite;
      }
    }).filter(Boolean);
  }
  _groupActiveSprites(activeSprites) {
    let groups = [];
    for (let _sprite of activeSprites) {
      // ts workaround for https://github.com/microsoft/TypeScript/issues/35940
      let sprite = _sprite;
      sprite.assertHasOwner();
      let {
        transition,
        duration
      } = this._childToTransition.get(sprite.owner);
      let group = groups.find(g => g.transition === transition);
      if (!group) {
        group = {
          transition,
          duration,
          sprites: []
        };
        groups.push(group);
      }
      group.sprites.push(sprite);
    }
    return groups;
  }
  _prepareSprite(sprite) {
    sprite.hide();
    let newElement = sprite.element.cloneNode(true);
    continueMotions(sprite.element, newElement);
    sprite.element = newElement;
    return sprite;
  }
  _onFirstMotionStart(activeSprites, cycle, sprite) {
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
      let s = Object.assign({}, sprite.initialComputedStyle);
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
  _onMotionStart(cycle, sprite) {
    sprite.assertHasOwner();
    sprite.reveal();
    sprite.owner.block(cycle);
  }
  _onMotionEnd(cycle, sprite) {
    sprite.assertHasOwner();
    sprite.owner.unblock(cycle);
  }
}
setComponentTemplate(TEMPLATE, AnimatedOrphans);

export { AnimatedOrphans as default };
//# sourceMappingURL=animated-orphans.js.map
