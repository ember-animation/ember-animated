import { alias } from '@ember/object/computed';
import { computed, get, action } from '@ember/object';
import { inject } from '@ember/service';
import Component, { setComponentTemplate } from '@ember/component';
import assertNever from 'assert-never';
import { task } from '../-private/ember-scheduler.js';
import { current } from '../-private/scheduler.js';
import { afterRender, microwait } from '../-private/concurrency-helpers.js';
import TransitionContext, { runToCompletion } from '../-private/transition-context.js';
import Sprite from '../-private/sprite.js';
import { keyForArray, componentNodes } from '../-private/ember-internals.js';
import partition from '../-private/partition.js';
import Child from '../-private/child.js';
import { precompileTemplate } from '@ember/template-compilation';
import { g, i, n } from 'decorator-transforms/runtime';

var TEMPLATE = precompileTemplate("{{~#each this.renderedChildren key=\"id\" as |child|~}}\n  <-EaListElement @child={{child}} @elementToChild={{this._elementToChild}}>\n    {{~yield child.value child.index~}}\n  </-EaListElement>\n{{~else}}\n  {{~yield to=\"inverse\"~}}\n{{/each}}\n");

/**
  A drop in replacement for `{{#each}}` that animates changes to a list.

  ```hbs
  {{#animated-each items use=transition duration=2000 as |item|}}
    <div data-test-item={{item}} onclick={{action removeItem item}}>
      {{item}}
    </div>
  {{/animated-each}}
  ```
  ```js
  import Component from '@ember/component';
  import move from 'ember-animated/motions/move';
  import { fadeOut } from 'ember-animated/motions/opacity';

  export default Component.extend({
    init() {
      this._super();
      this.items = ['A', 'B', 'C', 'D', 'E'];
    },

    * transition({ keptSprites, removedSprites }) {
      for (let sprite of keptSprites) {
        move(sprite);
      }

      for (let sprite of removedSprites) {
        fadeOut(sprite);
      }
    },

    removeItem(item){
      this.set('items', this.items.filter(i => i !== item));
    }
  });
  ```
  @class animated-each
  @public
*/
class AnimatedEach extends Component {
  tagName = '';
  static positionalParams = ['items'];
  static {
    g(this.prototype, "motionService", [inject('-ea-motion')]);
  }
  #motionService = (i(this, "motionService"), void 0);
  /**
   * The list of data you are trying to render.
    @argument items
    @type Array
  */
  items;

  /**
   * If set, this animator will only [match](../../between) other animators that have the same group value.
    @argument group
    @type String
  */
  group;

  /**
   * Represents the amount of time an animation takes in miliseconds.
    @argument duration
    @type Number
  */
  duration;

  /**
   * Specifies the [Transition](../../transitions)
   * to run when the list changes.
    @argument use
    @type Transition
  */
  use;

  /**
   * Specifies data-dependent [Rules](../../rules) that choose which [Transition](../../transitions)
   * to run when the list changes. This takes precedence over `use`.
    @argument rules
    @type Rules
  */
  rules;

  /**
   * When true, all the items in the list will animate as [`insertedSprites`](../../sprites) when the `{{#animated-each}}` is first rendered. Defaults to false.
    @argument initialInsertion
    @type Boolean
  */
  initialInsertion = false;

  /**
    When true, all the items in the list will animate as [`removedSprites`](../../sprites) when the `{{#animated-each}}` is destroyed. Defaults to false.
     Note that an `<AnimatedOrphans/>` component must be actively rendered when this animator is removed for this option to have any effect.
     @argument finalRemoval
    @type Boolean
  */
  finalRemoval = false;

  /**
    Serves the same purpose as the `key` in ember `{{#each}}`, and it's
    also used to compare values when [animating between components](../../between).
    @argument key
    @type String
  */
  key;

  /**
    An optional comma-separated list of properties to observe on each of the
    objects in the items list. If any of those properties change, we will
    trigger an animated transition. Without this, we only animate when the list
    contents change, not when any deeper properties change.
    @argument watch
    @type String
  */
  watch;

  // TODO: once TS conversion is complete, we can go around removing all the
  // underscores from private things.
  _elementToChild = new WeakMap();
  _prevItems = [];
  _prevSignature = [];
  _firstTime = true;
  _inserted = false;
  _renderedChildren = [];
  _renderedChildrenStartedMoving = false;
  _cycleCounter = 0;
  _keptSprites = null;
  _insertedSprites = null;
  _removedSprites = null;
  _lastTransition = null;
  _ancestorWillDestroyUs = false;

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init();
    this.motionService.register(this).observeDescendantAnimations(this, this.maybeReanimate) // TODO: shouldn't need this cast
    .observeAncestorAnimations(this, this.ancestorIsAnimating);
    this._installObservers();
  }
  _installObservers() {
    let key = this.key;
    if (key != null && key !== '@index' && key !== '@identity') {
      this.addObserver(`items.@each.${key}`, this, this._invalidateRenderedChildren);
    }
    let deps = this._deps;
    if (deps) {
      for (let dep of deps) {
        this.addObserver(`items.@each.${dep}`, this, this._invalidateRenderedChildren);
      }
    }
  }
  get _deps() {
    let w = this.watch;
    // Firefox has an `Object.prototype.watch` that can troll us here
    if (typeof w === 'string') {
      return w.split(/\s*,\s*/);
    }
    return undefined;
  }
  static {
    n(this.prototype, "_deps", [computed('watch')]);
  }
  get durationWithDefault() {
    let d = this.duration;
    if (d == null) {
      return 500;
    } else {
      return d;
    }
  }
  static {
    n(this.prototype, "durationWithDefault", [computed('duration')]);
  }
  _invalidateRenderedChildren() {
    this.notifyPropertyChange('renderedChildren');
  }
  _identitySignature(items, getKey) {
    if (!items) {
      return [];
    }
    let deps = this._deps;
    let signature = [];
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      signature.push(getKey(item, i));
      if (deps) {
        for (const dep of deps) {
          signature.push(get(item, dep));
        }
      }
    }
    return signature;
  }

  /* eslint-disable ember/require-computed-property-dependencies, ember/no-side-effects */
  // turning off these two rules for this method because we manage our own
  // internal state and know what we're doing.

  // this is where we handle most of the model state management. Based on the
  // `items` array we were given and our own earlier state, we update a list of
  // Child models that will be rendered by our template and decide whether an
  // animation is needed.
  get renderedChildren() {
    let firstTime = this._firstTime;
    this._firstTime = false;
    let getKey = this.keyGetter;
    let oldChildren = this._renderedChildren;
    let oldItems = this._prevItems;
    let oldSignature = this._prevSignature;
    let newItems = this.items;
    let newSignature = this._identitySignature(newItems, getKey);
    let group = this.group || '__default__';
    this._prevItems = newItems ? newItems.slice() : [];
    this._prevSignature = newSignature;
    if (!newItems) {
      newItems = [];
    }
    let oldIndices = new Map();
    oldChildren.forEach((child, index) => {
      oldIndices.set(child.id, index);
    });
    let newIndices = new Map();
    newItems.forEach((item, index) => {
      newIndices.set(getKey(item, index), index);
    });
    let newChildren = newItems.map((value, listIndex) => {
      let id = getKey(value, listIndex);
      let index = oldIndices.get(id);
      if (index != null) {
        let child = new Child(group, id, value, listIndex);
        child.state = 'kept';
        return child;
      } else {
        return new Child(group, id, value, listIndex);
      }
    }).concat(oldChildren.filter(child => (!child.shouldRemove || !this._renderedChildrenStartedMoving) && newIndices.get(child.id) == null).map(child => {
      child.flagForRemoval();
      return child;
    }));
    this._renderedChildren = newChildren;

    // in general, a removed sprite that didn't run a motion in the previous
    // animation gets instantly removed at the start of the next animation. But
    // there is a possible race condition if we recompute before the user's
    // transition even has a chance to begin. So this flag protects the removed
    // sprites until we can hand them off to the user's transition.
    this._renderedChildrenStartedMoving = false;
    if (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: untyped FastBoot global
    typeof FastBoot === 'undefined' && !isStable(oldSignature, newSignature)) {
      let transition = this._transitionFor(firstTime, oldItems, newItems);
      this.animate.perform(transition, firstTime);
    }
    return newChildren;
  }

  /* eslint-enable ember/require-computed-property-dependencies, ember/no-side-effects */
  static {
    n(this.prototype, "renderedChildren", [computed('items.[]', 'group')]);
  }
  static {
    g(this.prototype, "isAnimating", [alias('animate.isRunning')]);
  }
  #isAnimating = (i(this, "isAnimating"), void 0);
  get keyGetter() {
    return keyForArray(this.key);
  }
  static {
    n(this.prototype, "keyGetter", [computed('key')]);
  }
  didInsertElement() {
    super.didInsertElement();
    this._inserted = true;
  }
  *_ownElements() {
    if (!this._inserted) {
      return;
    }
    let {
      firstNode,
      lastNode
    } = componentNodes(this);
    let node = firstNode;
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        yield node;
      }
      if (node === lastNode) {
        break;
      }
      node = node.nextSibling;
    }
  }

  // This gets called by the motionService when another animator calls
  // willAnimate from within our descendant components.
  maybeReanimate() {
    if (this.animate.isRunning && !this.startAnimation.isRunning) {
      // A new animation is starting below us while we are in
      // progress. We should interrupt ourself in order to adapt to
      // the changing conditions.
      this.animate.perform(this._lastTransition);
    }
  }
  static {
    n(this.prototype, "maybeReanimate", [action]);
  }
  ancestorIsAnimating(ourState) {
    if (ourState === 'removing' && !this._ancestorWillDestroyUs) {
      // we just found out we're probably getting destroyed. Abandon
      // ship!
      this._ancestorWillDestroyUs = true;
      this._letSpritesEscape();
    } else if (ourState !== 'removing' && this._ancestorWillDestroyUs) {
      // we got a reprieve, our destruction was cancelled before it
      // could happen.
      this._ancestorWillDestroyUs = false;
      // treat all our sprites as re-inserted, because we had already handed them off as orphans
      let transition = this._transitionFor(this._firstTime, [], this._prevItems);
      this.animate.perform(transition);
    }
  }
  static {
    n(this.prototype, "ancestorIsAnimating", [action]);
  }
  _letSpritesEscape() {
    let transition = this._transitionFor(this._firstTime, this._prevItems, []);
    let removedSprites = [];
    let parent;
    for (let element of this._ownElements()) {
      if (!parent) {
        parent = Sprite.offsetParentStartingAt(element);
      }
      let sprite = Sprite.positionedStartingAt(element, parent);
      sprite.owner = this._elementToChild.get(element);
      removedSprites.push(sprite);
    }
    this.motionService.matchDestroyed(removedSprites, transition, this.durationWithDefault, this.finalRemoval);
  }
  willDestroyElement() {
    super.willDestroyElement();
    // if we already got early warning, we already let our sprites escape.
    if (!this._ancestorWillDestroyUs) {
      this._letSpritesEscape();
    }
    this.motionService.unregister(this).unobserveDescendantAnimations(this, this.maybeReanimate).unobserveAncestorAnimations(this, this.ancestorIsAnimating);
  }

  // this gets called by motionService when we call
  // staticMeasurement. But also whenever *any other* animator calls
  // staticMeasurement, even if we're in the middle of animating.
  beginStaticMeasurement() {
    if (this._keptSprites) {
      this._keptSprites.forEach(sprite => sprite.unlock());
      this._insertedSprites.forEach(sprite => sprite.unlock());
      this._removedSprites.forEach(sprite => sprite.display(false));
    }
  }
  endStaticMeasurement() {
    if (this._keptSprites) {
      this._keptSprites.forEach(sprite => sprite.lock());
      this._insertedSprites.forEach(sprite => sprite.lock());
      this._removedSprites.forEach(sprite => sprite.display(true));
    }
  }
  _findCurrentSprites() {
    let currentSprites = [];
    let parent;
    for (let element of this._ownElements()) {
      if (!parent) {
        parent = Sprite.offsetParentStartingAt(element);
      }
      let sprite = Sprite.positionedStartingAt(element, parent);
      currentSprites.push(sprite);
    }
    return {
      currentSprites,
      parent
    };
  }
  _partitionKeptAndRemovedSprites(currentSprites) {
    currentSprites.forEach(sprite => {
      if (!sprite.element.parentElement) {
        // our currentSprites list was created based on what was in
        // DOM before rendering. Now we are looking after
        // rendering. So some of the removed sprites may have been
        // garbage collected out (based on the logic in
        // renderedChildren()). If so, they will no longer be in the
        // DOM, and we filter them out here.
        return;
      }
      let child = this._elementToChild.get(sprite.element);
      sprite.owner = child;
      if (this._ancestorWillDestroyUs) {
        this._removedSprites.push(sprite);
      } else {
        switch (child.state) {
          case 'kept':
            this._keptSprites.push(sprite);
            break;
          case 'removing':
            this._removedSprites.push(sprite);
            break;
          case 'new':
            // This can happen when our animation gets restarted due to
            // another animation possibly messing with our DOM, as opposed
            // to restarting because our own data changed.
            this._keptSprites.push(sprite);
            break;
          default:
            throw assertNever(child.state);
        }
      }
    });
  }

  // The animate task is split into three subtasks that represent
  // three distinct phases. This is necessary for the proper
  // coordination of multiple animators.
  //
  //   1. During `startAnimation`, we ignore notifications about
  //   descendant animations (see maybeReanimate), because we're still
  //   waiting for Ember to finish rendering anyway and we haven't
  //   kicked off our own animation.
  //
  //   2. During `runAnimation`, other animators will know that we are
  //   actually still animating things, so if they are entangled with
  //   us they should not finalize. (They get entangled via farMatch,
  //   meaning some of their sprites and some of our sprites match
  //   up).
  //
  //   3. During `finalizeAnimation`, we are waiting for our entangled
  //   animators that are still in `runAnimation`, then we are
  //   cleaning up our own sprite state.
  //
  static {
    g(this.prototype, "animate", [task(function* (transition, firstTime) {
      let {
        parent,
        currentSprites,
        insertedSprites,
        keptSprites,
        removedSprites
      } = yield this.startAnimation.perform(transition, current());
      let {
        matchingAnimatorsFinished
      } = yield this.runAnimation.perform(transition, parent, currentSprites, insertedSprites, keptSprites, removedSprites, firstTime);
      yield this.finalizeAnimation.perform(insertedSprites, keptSprites, removedSprites, matchingAnimatorsFinished);
    }).restartable()]);
  }
  #animate = (i(this, "animate"), void 0);
  static {
    g(this.prototype, "startAnimation", [task(function* (transition, animateTask) {
      // we remember the transition we're using in case we need to
      // recalculate based on other animators potentially moving our DOM
      // around
      this._lastTransition = transition;

      // Reset the sprite lists. These are component state mostly
      // because beginStaticMeasurement needs to be able to put
      // everything into static positioning at any point in time, so
      // that any animation that's starting up can figure out what the
      // DOM is going to look like.
      let keptSprites = this._keptSprites = [];
      let removedSprites = this._removedSprites = [];
      let insertedSprites = this._insertedSprites = [];

      // Start by locating our current sprites based off the actual DOM
      // elements we contain. This records their initial positions.
      let {
        currentSprites,
        parent
      } = this._findCurrentSprites();

      // Warn the rest of the universe that we're about to animate.
      this.motionService.willAnimate({
        task: animateTask,
        duration: this.durationWithDefault,
        component: this,
        children: this._renderedChildren
      });

      // Make all our current sprites absolutely positioned so they won't move during render.
      currentSprites.forEach(sprite => sprite.lock());

      // Wait for Ember to render our latest state.
      yield afterRender();
      return {
        parent,
        currentSprites,
        insertedSprites,
        keptSprites,
        removedSprites
      };
    })]);
  }
  #startAnimation = (i(this, "startAnimation"), void 0);
  static {
    g(this.prototype, "runAnimation", [task(function* (transition, parent, currentSprites, insertedSprites, keptSprites, removedSprites, firstTime) {
      // fill the keptSprites and removedSprites lists by comparing what
      // we had in currentSprites with what is still in the DOM now that
      // rendering happened.
      this._partitionKeptAndRemovedSprites(currentSprites);

      // perform static measurement. The motionService coordinates this
      // because all animators need to be simultaneously put into their
      // static state via beginStaticMeasurement and endStaticMeasurement.
      yield* this.motionService.staticMeasurement(() => {
        // we care about the final position of our own DOM parent. That
        // lets us nest motions correctly.
        if (parent && !parent.finalBounds) {
          parent.measureFinalBounds();
        }
        for (let element of this._ownElements()) {
          // now is when we find all the newly inserted sprites and
          // remember their final bounds.
          if (!currentSprites.find(sprite => sprite.element === element)) {
            if (!parent) {
              parent = Sprite.offsetParentEndingAt(element);
            }
            let sprite = Sprite.positionedEndingAt(element, parent);
            sprite.owner = this._elementToChild.get(element);
            sprite.hide();
            insertedSprites.push(sprite);
          }
        }
        // and remember the final bounds of all our kept sprites
        keptSprites.forEach(sprite => sprite.measureFinalBounds());
      });

      // at this point we know all the geometry of our own sprites. But
      // some of our sprites may match up with sprites that are entering
      // or leaving other simulatneous animators. So we hit another
      // coordination point via the motionService
      let {
        farMatches,
        matchingAnimatorsFinished,
        beacons
      } = yield this.motionService.get('farMatch').perform(current(), insertedSprites, keptSprites, removedSprites);

      // TODO: This is best effort. The parent isn't necessarily in
      // the initial position at this point, but in practice if people
      // are properly using animated-containers it will be locked into
      // that position. We only need this if there were no elements to
      // begin with. A better solution would figure out what the
      // offset parent *would* be even when there are no elements,
      // based on our own placeholder comment nodes.
      if (parent && !parent.initialBounds) {
        parent.measureInitialBounds();
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

      // if any of our inserted sprites have matching far away sprites,
      // they become receivedSprites and they get initialBounds
      // (derived from their far away matching sprite) and motion
      // continuity via `startAtSprite`.
      let [receivedSprites, unmatchedInsertedSprites] = partition(insertedSprites, sprite => {
        let other = farMatches.get(sprite);
        if (other) {
          sprite.startAtSprite(other);
          return true;
        }
        return false;
      });
      let [matchedKeptSprites, unmatchedKeptSprites] = partition(keptSprites, sprite => {
        let other = farMatches.get(sprite);
        if (other) {
          if (other.revealed && !sprite.revealed) {
            sprite.startAtSprite(other);
          }
          return true;
        }
        return false;
      });

      // let other animators make their own partitioning decisions
      // before we start hiding the sent & received sprites yield
      yield microwait();
      matchedKeptSprites.forEach(s => s.hide());
      sentSprites.forEach(s => s.hide());

      // By default, we don't treat sprites as "inserted" when our
      // component first renders. You can override that by setting
      // initialInsertion=true.
      if (firstTime && !this.initialInsertion) {
        // Here we are effectively hiding the inserted sprites from the
        // user's transition function and just immediately revealing
        // them in their final positions instead.
        unmatchedInsertedSprites.forEach(s => s.reveal());
        unmatchedInsertedSprites = [];
      }

      // if we are interrupted after this point, any removed children that didn't
      // actually undergo a motion will be immediately destroyed.
      this._renderedChildrenStartedMoving = true;

      // Early exit if nothing is happening.
      if (!transition || unmatchedInsertedSprites.length === 0 && unmatchedKeptSprites.length === 0 && unmatchedRemovedSprites.length === 0 && sentSprites.length === 0 && receivedSprites.length === 0 && matchedKeptSprites.length === 0) {
        return {
          matchingAnimatorsFinished
        };
      }
      let context = new TransitionContext(this.durationWithDefault, unmatchedInsertedSprites,
      // user-visible insertedSprites
      unmatchedKeptSprites,
      // user-visible keptSprites
      unmatchedRemovedSprites,
      // user-visible removedSprites
      sentSprites,
      // user-visible sentSprites
      receivedSprites.concat(matchedKeptSprites),
      // user-visible receivedSprites
      beacons, sprite => this._motionStarted(sprite, cycle), sprite => this._motionEnded(sprite, cycle));
      let cycle = this._cycleCounter++;
      yield* runToCompletion(context, transition);
      return {
        matchingAnimatorsFinished
      };
    })]);
  }
  #runAnimation = (i(this, "runAnimation"), void 0); // todo: restartable?
  static {
    g(this.prototype, "finalizeAnimation", [task(function* (insertedSprites, keptSprites, removedSprites, matchingAnimatorsFinished) {
      yield matchingAnimatorsFinished;

      // The following cleanup ensures that all the sprites that will
      // stay on the page after our animation are unlocked and
      // revealed. We may have already revealed most of them, but if an
      // inserted sprite was never subject to a motion it will appear
      // here, and if a previous transition was interrupted before an
      // inserted sprite could be revealed, it could have become a kept
      // sprite for us.
      keptSprites.forEach(sprite => {
        sprite.unlock();
        sprite.reveal();
      });
      insertedSprites.forEach(sprite => {
        sprite.unlock();
        sprite.reveal();
      });
      this._keptSprites = null;
      this._removedSprites = null;
      this._insertedSprites = null;
      if (removedSprites.length > 0) {
        // trigger a rerender to reap our removed children
        this.notifyPropertyChange('renderedChildren');
        // wait for the render to happen before we allow our animation
        // to be done
        yield afterRender();
      }
    })]);
  }
  #finalizeAnimation = (i(this, "finalizeAnimation"), void 0);
  _motionStarted(sprite, cycle) {
    sprite.reveal();
    sprite.owner.block(cycle);
  }
  _motionEnded(sprite, cycle) {
    sprite.owner.unblock(cycle);
  }
  _transitionFor(firstTime, oldItems, newItems) {
    let rules = this.rules;
    if (rules) {
      return rules({
        firstTime,
        oldItems,
        newItems
      });
    } else {
      return this.use;
    }
  }
}
function isStable(before, after) {
  if (before.length !== after.length) {
    return false;
  }
  for (let i = 0; i < before.length; i++) {
    if (before[i] !== after[i]) {
      return false;
    }
  }
  return true;
}
setComponentTemplate(TEMPLATE, AnimatedEach);

export { AnimatedEach as default };
//# sourceMappingURL=animated-each.js.map
