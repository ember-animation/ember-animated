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

  animationStarting() {
    if (this.get('animate.isRunning') && !this._startingUp) {
      // A new animation is starting on the page while we are in
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

  animate: task(function * (transition) {
    this._startingUp = true;
    this._lastTransition = transition;
    let keptSprites = this._keptSprites = [];
    let removedSprites = this._removedSprites = [];
    let insertedSprites = this._insertedSprites = [];

    let currentSprites = [];
    let parent;
    for (let element of this._ownElements()) {
      if (!parent) {
        parent = Sprite.offsetParentStartingAt(element);
      }
      let sprite = Sprite.positionedStartingAt(element, parent);
      currentSprites.push(sprite);
    }

    this.get('motionService').willAnimate({
      task: current(),
      duration: this.get('durationWithDefault'),
      component: this
    });

    currentSprites.forEach(sprite => sprite.lock());

    try {
      yield afterRender();
    } finally {
      this._startingUp = false;
    }

    currentSprites.forEach(sprite => {
      let child = this._elementToChild.get(sprite.element);
      sprite.owner = child;
      switch (child.state) {
      case 'kept':
        keptSprites.push(sprite);
        break;
      case 'removing':
        removedSprites.push(sprite);
        break;
      case 'new':
        // This can happen when our animation gets restarted due to
        // another animation possibly messing with our DOM, as opposed
        // to restarting because our own data changed.
        keptSprites.push(sprite);
        break;
      default:
        Ember.warn(`Probable bug in ember-animated: saw unexpected child state ${child.state}`, false, { id: "ember-animated-state" });
      }
    });

    yield * this.get('motionService').staticMeasurement(() => {
      if (parent && !parent.finalBounds) {
        parent.measureFinalBounds();
      }

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
      keptSprites.forEach(sprite => sprite.measureFinalBounds());
    });

    let farMatches = yield this.get('motionService.farMatch').perform(insertedSprites, keptSprites, removedSprites);

    // any removed sprites that matched elsewhere will get handled elsewhere
    let unmatchedRemovedSprites = removedSprites.filter(sprite => {
      if (farMatches.get(sprite)) {
        sprite.hide();
        return false;
      } else {
        return true;
      }
    })

    if (parent && !parent.initialBounds) {
      // TODO: This is best effort. The parent isn't necessarily in
      // the initial position at this point, but in practice if people
      // are properly using animated-containers it will be locked into
      // that position. We only need this if there were no elements to
      // begin with. A better solution would figure out what the
      // offset parent *would* be even when there are no elements,
      // based on our own placeholder comment nodes.
      parent.measureInitialBounds();
    }

    // any inserted sprites that have far matches are treated more
    // like kept sprites.
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
