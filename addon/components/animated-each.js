import { warn } from '@ember/debug';
import { alias } from '@ember/object/computed';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from '../templates/components/animated-each';
import { task } from '../-private/ember-scheduler';
import { current } from '../-private/scheduler';
import { afterRender, microwait } from '..';
import TransitionContext from '../-private/transition-context';
import Sprite from '../-private/sprite';
import { componentNodes, keyForArray } from '../-private/ember-internals';
import partition from '../-private/partition';

export default Component.extend({
  layout,
  tagName: '',
  motionService: service('-ea-motion'),
  duration: null,
  use: null,
  rules: null,
  initialInsertion: false,

  init() {
    this._elementToChild = new WeakMap();
    this._prevItems = [];
    this._prevSignature = [];
    this._firstTime = true;
    this._inserted = false;
    this._renderedChildren = [];
    this._cycleCounter = 0;
    this._keptSprites = null;
    this._insertedSprites = null;
    this._removedSprites = null;
    this.maybeReanimate = this.maybeReanimate.bind(this);
    this.ancestorIsAnimating = this.ancestorIsAnimating.bind(this);
    this.get('motionService')
      .register(this)
      .observeDescendantAnimations(this, this.maybeReanimate)
      .observeAncestorAnimations(this, this.ancestorIsAnimating);
    this._installObservers();
    this._lastTransition = null;
    this._ancestorWillDestroyUs = false;
    this._super();
  },

  _installObservers() {
    let key = this.get('key');
    if (key != null && key !== '@index' && key !== '@identity') {
      this.addObserver(`items.@each.${key}`, this, this._invalidateRenderedChildren);
    }

    let deps = this.get('_deps');
    if (deps) {
      for (let dep of deps) {
        this.addObserver(`items.@each.${dep}`, this, this._invalidateRenderedChildren);
      }
    }
  },

  _deps: computed('watch', function() {
    let w = this.get('watch');
    // Firefox has an `Object.prototype.watch` that can troll us here
    if (typeof w === 'string') {
      return w.split(/\s*,\s*/);
    }
  }),

  durationWithDefault: computed('duration', function() {
    let d = this.get('duration');
    if (d == null) {
      return 2000;
    } else {
      return d;
    }
  }),

  _invalidateRenderedChildren() {
    this.notifyPropertyChange('renderedChildren');
  },

  _identitySignature(items, getKey) {
    if (!items) { return []; }
    let deps = this.get('_deps');
    let signature = [];
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      signature.push(getKey(item));
      if (deps) {
        for (let j = 0; j < deps.length; j++) {
          let dep = deps[j];
          signature.push(get(item, dep));
        }
      }
    }
    return signature;
  },

  // this is where we handle most of the model state management. Based
  // on the `items` array we were given and our own earlier state, we
  // update a list of Child models that will be rendered by our
  // template and decide whether an animation is needed.
  renderedChildren: computed('items.[]', 'group', function() {
    let firstTime = this._firstTime;
    this._firstTime = false;

    let getKey = this.get('keyGetter');
    let oldChildren = this._renderedChildren;
    let oldItems = this._prevItems;
    let oldSignature = this._prevSignature;
    let newItems = this.get('items');
    let newSignature = this._identitySignature(newItems, getKey);
    let group = this.get('group') || '__default__';
    this._prevItems = newItems ? newItems.slice() : [];
    this._prevSignature = newSignature;
    if (!newItems) { newItems = []; }

    let oldIndices = new Map();
    oldChildren.forEach((child, index) => {
      oldIndices.set(child.id, index);
    });

    let newIndices = new Map();
    newItems.forEach((item, index) => {
      newIndices.set(getKey(item), index);
    });

    let newChildren = newItems.map(value => {
      let id = getKey(value);
      let index = oldIndices.get(id);
      if (index != null) {
        let child = new Child(group, id, value);
        child.state = 'kept';
        return child;
      } else {
        return new Child(group, id, value);
      }
    }).concat(
      oldChildren
        .filter(child => !child.shouldRemove && newIndices.get(child.id) == null)
        .map(child => {
          child.flagForRemoval();
          return child;
        })
    );
    this._renderedChildren = newChildren;

    if (!isStable(oldSignature, newSignature)) {
      let transition = this._transitionFor(firstTime, oldItems, newItems);
      this.get('animate').perform(transition, firstTime);
    }

    return newChildren;
  }),

  isAnimating: alias('animate.isRunning'),

  keyGetter: computed('key', function() {
    return keyForArray(this.get('key'));
  }),

  didInsertElement() {
    this._inserted = true;
  },

  * _ownElements() {
    if (!this._inserted) { return; }
    let { firstNode, lastNode } = componentNodes(this);
    let node = firstNode;
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        yield node;
      }
      if (node === lastNode){ break; }
      node = node.nextSibling;
    }
  },

  // This gets called by the motionService when another animator calls
  // willAnimate from within our descendant components.
  maybeReanimate() {
    if (this.get('animate.isRunning') && !this.get('startAnimation.isRunning')) {
      // A new animation is starting below us while we are in
      // progress. We should interrupt ourself in order to adapt to
      // the changing conditions.
      this.get('animate').perform(this._lastTransition);
    }
  },

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
      this.get('animate').perform(transition);
    }
  },

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
    this.get('motionService').matchDestroyed(removedSprites, transition, this.get('durationWithDefault'));
  },

  willDestroyElement() {
    // if we already got early warning, we already let our sprites escape.
    if (!this._ancestorWillDestroyUs) {
      this._letSpritesEscape();
    }
    this.get('motionService')
      .unregister(this)
      .unobserveDescendantAnimations(this, this.maybeReanimate)
      .unobserveAncestorAnimations(this, this.ancestorIsAnimating);
  },

  // this gets called by motionService when we call
  // staticMeasurement. But also whenever *any other* animator calls
  // staticMeasurement, even if we're in the middle of animating.
  beginStaticMeasurement(){
    if (this._keptSprites) {
      this._keptSprites.forEach(sprite => sprite.unlock());
      this._insertedSprites.forEach(sprite => sprite.unlock());
      this._removedSprites.forEach(sprite => sprite.display(false));
    }
  },

  endStaticMeasurement(){
    if (this._keptSprites) {
      this._keptSprites.forEach(sprite => sprite.lock());
      this._insertedSprites.forEach(sprite => sprite.lock());
      this._removedSprites.forEach(sprite => sprite.display(true));
    }
  },

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
    return { currentSprites, parent };
  },

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
          warn(`Probable bug in ember-animated: saw unexpected child state ${child.state}`, false, { id: "ember-animated-state" });
        }
      }
    });
  },

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
  animate: task(function * (transition, firstTime) {
    let {
      parent,
      currentSprites,
      insertedSprites,
      keptSprites,
      removedSprites
    } = yield this.get('startAnimation').perform(transition, current());

    let { matchingAnimatorsFinished } = yield this.get('runAnimation').perform(transition, parent, currentSprites, insertedSprites, keptSprites, removedSprites, firstTime);
    yield this.get('finalizeAnimation').perform(insertedSprites, keptSprites, removedSprites, matchingAnimatorsFinished);
  }).restartable(),

  startAnimation: task(function * (transition, animateTask) {
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
    let { currentSprites, parent } = this._findCurrentSprites();

    // Warn the rest of the universe that we're about to animate.
    this.get('motionService').willAnimate({
      task: animateTask,
      duration: this.get('durationWithDefault'),
      component: this,
      children: this._renderedChildren
    });

    // Make all our current sprites absolutely positioned so they won't move during render.
    currentSprites.forEach(sprite => sprite.lock());

    // Wait for Ember to render our latest state.
    yield afterRender();
    return { parent, currentSprites, insertedSprites, keptSprites, removedSprites };
  }),

  runAnimation: task(function * (transition, parent, currentSprites, insertedSprites, keptSprites, removedSprites, firstTime) {
    // fill the keptSprites and removedSprites lists by comparing what
    // we had in currentSprites with what is still in the DOM now that
    // rendering happened.
    this._partitionKeptAndRemovedSprites(currentSprites);

    // perform static measurement. The motionService coordinates this
    // because all animators need to be simultaneously put into their
    // static state via beginStaticMeasurement and endStaticMeasurement.
    yield * this.get('motionService').staticMeasurement(() => {

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
    let { farMatches, matchingAnimatorsFinished } = yield this.get('motionService.farMatch').perform(
      current(),
      insertedSprites,
      keptSprites,
      removedSprites
    );

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
    });

    let [matchedKeptSprites, unmatchedKeptSprites] = partition(keptSprites, sprite => {
      let other = farMatches.get(sprite);
      if (other) {
        if (other.revealed && !sprite.revealed) {
          sprite.startAtSprite(other);
        }
        return true;
      }
    });

    // let other animators make their own partitioning decisions
    // before we start hiding the sent & received sprites yield
    yield microwait();

    matchedKeptSprites.forEach(s => s.hide());
    sentSprites.forEach(s => s.hide());

    // By default, we don't treat sprites as "inserted" when our
    // component first renders. You can override that by setting
    // initialInsertion=true.
    if (firstTime && !this.get('initialInsertion')) {
      // Here we are effectively hiding the inserted sprites from the
      // user's transition function and just immediately revealing
      // them in their final positions instead.
      unmatchedInsertedSprites.forEach(s => s.reveal());
      unmatchedInsertedSprites = [];
    }

    // Early exit if nothing is happening.
    if (!transition ||
        ( unmatchedInsertedSprites.length === 0 &&
          unmatchedKeptSprites.length === 0 &&
          unmatchedRemovedSprites.length === 0 &&
          sentSprites.length === 0 &&
          receivedSprites.length === 0 &&
          matchedKeptSprites.length === 0)) {
      return { matchingAnimatorsFinished };
    }

    let context = new TransitionContext(
      this.get('durationWithDefault'),
      unmatchedInsertedSprites,                      // user-visible insertedSprites
      unmatchedKeptSprites,                          // user-visible keptSprites
      unmatchedRemovedSprites,                       // user-visible removedSprites
      sentSprites,                                   // user-visible sentSprites
      receivedSprites.concat(matchedKeptSprites)     // user-visible receivedSprites
    );
    let cycle = this._cycleCounter++;
    context.onMotionStart = sprite => this._motionStarted(sprite, cycle);
    context.onMotionEnd = sprite => this._motionEnded(sprite, cycle);

    yield * context._runToCompletion(transition);
    return { matchingAnimatorsFinished };
  }),

  finalizeAnimation: task(function * (insertedSprites, keptSprites, removedSprites, matchingAnimatorsFinished) {
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

  }),

  _motionStarted(sprite, cycle) {
    sprite.reveal();
    sprite.owner.block(cycle);
  },

  _motionEnded(sprite, cycle) {
    sprite.owner.unblock(cycle);
  },

  _transitionFor(firstTime, oldItems, newItems) {
    let rules = this.get('rules')
    if (rules) {
      return rules({firstTime, oldItems, newItems});
    } else {
      return this.get('use');
    }
  }
}).reopenClass({
  positionalParams: ['items']
});


class Child {
  constructor(group, id, value) {
    this.group = group;
    this.id = id;
    this.value = value;

    // new, kept, or removing
    this.state = 'new';
    this.removalBlockers = 0;
    this.removalCycle = null;
  }

  block(cycle) {
    if (this.removalCycle == null || this.removalCycle === cycle) {
      this.removalCycle = cycle;
      this.removalBlockers++;
    }
  }

  unblock(cycle) {
    if (this.removalCycle === cycle) {
      this.removalBlockers--;
    }
  }

  flagForRemoval() {
    this.removalCycle = null;
    this.removalBlockers = 0;
    this.state = 'removing';
  }

  get shouldRemove() {
    return this.state === 'removing' && this.removalBlockers < 1;
  }

  clone() {
    return new Child(this.group, this.id, this.value);
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
