import Ember from 'ember';
import layout from '../templates/components/animated-each';
import { task } from '../ember-scheduler';
import { current } from '../scheduler';
import { afterRender } from '../concurrency-helpers';
import TransitionContext from '../transition-context';
import Sprite from '../sprite';
import { componentNodes, keyForArray } from 'ember-animated/ember-internals';

export default Ember.Component.extend({
  layout,
  tagName: '',
  motionService: Ember.inject.service('-ea-motion'),
  duration: null,
  use: null,
  rules: null,

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
    this.get('motionService').register(this);
    this._installObservers();
    this._startingUp = false;
    this._lastTransition = null;
    this._spriteMarkers = [];
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

  _deps: Ember.computed('watch', function() {
    let w = this.get('watch');
    // Firefox has an `Object.prototype.watch` that can troll us here
    if (typeof w === 'string') {
      return w.split(/\s*,\s*/);
    }
  }),

  durationWithDefault: Ember.computed('duration', function() {
    let d = this.get('duration');
    if (d == null) {
      return 2000;
    } else {
      return d;
    }
  }),

  _invalidateRenderedChildren() {
    this.propertyDidChange('renderedChildren');
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
          signature.push(Ember.get(item, dep));
        }
      }
    }
    return signature;
  },

  // this is where we handle most of the model state management. Based
  // on the `items` array we were given and our own earlier state, we
  // update a list of Child models that will be rendered by our
  // template and decide whether an animation is needed.
  renderedChildren: Ember.computed('items.[]', function() {
    let firstTime = this._firstTime;
    this._firstTime = false;

    let getKey = this.get('keyGetter');
    let oldChildren = this._renderedChildren;
    let oldItems = this._prevItems;
    let oldSignature = this._prevSignature;
    let newItems = this.get('items');
    let newSignature = this._identitySignature(newItems, getKey);
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
        let child = new Child(id, value);
        child.state = 'kept';
        return child;
      } else {
        return new Child(id, value);
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
      if (transition) {
        this.get('animate').perform(transition);
      }
    }

    return newChildren;
  }),

  isAnimating: Ember.computed.alias('animate.isRunning'),

  keyGetter: Ember.computed('key', function() {
    return keyForArray(this.get('key'));
  }),

  registerSpriteMarker(markerComponent) {
    this._spriteMarkers.push(markerComponent);
  },

  unregisterSpriteMarker(markerComponent) {
    let index = this._spriteMarkers.indexOf(markerComponent);
    if (index !== -1) {
      this._spriteMarkers.splice(index, 1);
    }
  },


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
  animationStarting() {
    if (this.get('animate.isRunning') && !this._startingUp) {
      // A new animation is starting below us while we are in
      // progress. We should interrupt ourself in order to adapt to
      // the changing conditions.
      this.get('animate').perform(this._lastTransition);
    }
  },

  willDestroyElement() {
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
    this.get('motionService').matchDestroyed(removedSprites);
    this.get('motionService').unregister(this);
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

    for (let marker of this._spriteMarkers) {
      let parentSprite, child;
      for (let element of marker.ownElements()) {
        if (!parentSprite) {
          parentSprite = findParentSprite(element, currentSprites, parent.element);
          child = Child.forMarker(marker, parentSprite);
          child.state = 'kept';
        }
        let sprite = Sprite.positionedStartingAt(element, parentSprite);
        currentSprites.push(sprite);
        this._elementToChild.set(element, child);
      }
    }

    return { currentSprites, parent };
  },

  _partitionKeptAndRemovedSprites(currentSprites) {
    currentSprites.forEach(sprite => {
      let child = this._elementToChild.get(sprite.element);
      sprite.owner = child;
      if (child.parentSprite) {
        child.state = child.parentSprite.owner.state;
      }
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
        Ember.warn(`Probable bug in ember-animated: saw unexpected child state ${child.state}`, false, { id: "ember-animated-state" });
      }
    });
  },

  animate: task(function * (transition) {
    // we distinguish the early stage of an animation that happens
    // before render from what comes after.
    this._startingUp = true;

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
      task: current(),
      duration: this.get('durationWithDefault'),
      component: this
    });

    // Make all our current sprites absolutely positioned so they won't move during render.
    currentSprites.forEach(sprite => sprite.lock());

    // Wait for Ember to render our latest state.
    try {
      yield afterRender();
    } finally {
      // At this point we move out of startingUp mode. This is in a
      // finally block because it's possible our task was interrupted.
      this._startingUp = false;
    }

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

      // now is when we find all the newly inserted sprites and
      // remember their final bounds.

      for (let element of this._ownElements()) {
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

      for (let marker of this._spriteMarkers) {
        let parentSprite, child;
        for (let element of marker.ownElements()) {
          if (!currentSprites.find(sprite => sprite.element === element)) {
            if (!parentSprite) {
              parentSprite = findParentSprite(element, currentSprites.concat(insertedSprites), parent.element);
              child = Child.forMarker(marker, parentSprite);
            }
            let sprite = Sprite.positionedEndingAt(element, parentSprite);
            sprite.owner = child;
            sprite.hide();
            insertedSprites.push(sprite);
          }
        }
      }

      // and remember the final bounds of all our kept sprites
      keptSprites.forEach(sprite => sprite.measureFinalBounds());
    });

    // at this point we know all the geometry of our own sprites. But
    // some of our sprites may match up with sprites that are entering
    // or leaving other simulatneous animators. So we hit another
    // coordination point via the motionService
    let farMatches = yield this.get('motionService.farMatch').perform(insertedSprites, keptSprites, removedSprites);

    // if any of our removed sprites have matches elsewhere, they
    // won't be handled by our transition. Instead they will become
    // the initialBounds for the sprites that they matched in the
    // other animator. We hide them here because we're not allowed to
    // animate them anyway, and they were already on their way out.
    let unmatchedRemovedSprites = removedSprites.filter(sprite => {
      if (farMatches.get(sprite)) {
        sprite.hide();
        return false;
      } else {
        return true;
      }
    })

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

    // if any of our inserted sprites have matching far away sprites,
    // we treat them like kept sprites. That is, they will get
    // initialBounds (derived from their far away matching sprite) and
    // motion continuity via `startAt`, and we will pass them into the
    // transition context as part of the keptSprites, not the
    // insertedSprites.
    let matchedInsertedSprites = [];
    let unmatchedInsertedSprites = [];
    insertedSprites.forEach(sprite => {
      let other = farMatches.get(sprite);
      if (other) {
        sprite.startAt(other);
        matchedInsertedSprites.push(sprite);
      } else {
        unmatchedInsertedSprites.push(sprite);
      }
    });

    // if any of our keptSprites are hidden and have far matches, we
    // let the far matches override their own initialBounds. This
    // helps handle a common case where a child was leaving but is now
    // coming back due an interruption.
    keptSprites.forEach(sprite => {
      let other = farMatches.get(sprite);
      if (other && !sprite.revealed) {
        sprite.startAt(other);
      }
    });

    let context = new TransitionContext(
      this.get('durationWithDefault'),
      unmatchedInsertedSprites,
      keptSprites.concat(matchedInsertedSprites),
      unmatchedRemovedSprites
    );
    let cycle = this._cycleCounter++;
    context.onMotionStart = sprite => this._motionStarted(sprite, cycle);
    context.onMotionEnd = sprite => this._motionEnded(sprite, cycle);

    yield * context._runToCompletion(transition);

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
      this.propertyDidChange('renderedChildren');
    }

  }).restartable(),

  _motionStarted(sprite, cycle) {
    sprite.reveal();
    sprite.owner.block(cycle);
  },

  _motionEnded(sprite, cycle) {
    sprite.owner.unblock(cycle);
  },

  _transitionFor(firstTime, oldItems, newItems) {
    let transition = this.get('use');
    if (transition) {
      return transition;
    }
    let rules = this.get('rules');
    if (rules) {
      return rules(firstTime, oldItems, newItems);
    }
  }
}).reopenClass({
  positionalParams: ['items']
});


class Child {
  constructor(id, value) {
    this.id = id;
    this.value = value;

    // new, kept, or removing
    this.state = 'new';
    this.removalBlockers = 0;
    this.removalCycle = null;

    // Used by children that represent marked sprites
    this.parentSprite = null;
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

  static forMarker(markerComponent, parentSprite) {
    let value = markerComponent.get('item');
    let id = keyForArray(markerComponent.get('key'))(value);
    let result = new this(id, value);
    result.parentSprite = parentSprite;
    return result;
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

function findParentSprite(element, currentSprites, limitElement) {
  // walk upward from our marked sprite's element. Stop if you
  // get to limitElement. `parent` must be defined here because
  // if we have any sprite markers, we must have at least one
  // ownElement, because spriteMarkers are descendants of
  // ownElements.
  let pointer = element;
  let parentSprite;
  while (pointer && pointer !== limitElement) {
    parentSprite = currentSprites.find(s => s.element === pointer);
    if (parentSprite) {
      break;
    }
    pointer = pointer.parentNode;
  }
  if (!parentSprite) {
    throw new Error("Bug in animated-each: a marked sprite could not find its parent sprite")
  }
  if (parentSprite.element === element) {
    throw new Error("You used marked-sprite as a direct descendant of an animator component. This is redundant because direct descendants of an animator component are already always marked to be sprites");
  }
  return parentSprite;
}
