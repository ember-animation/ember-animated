import Ember from 'ember';
import layout from '../templates/components/animated-each';
import { task } from 'ember-concurrency';
import { afterRender } from '../concurrency-helpers';
import TransitionContext from '../transition-context';
import Sprite from '../sprite';
import { componentNodes, keyForArray } from 'ember-animated/ember-internals';

export default Ember.Component.extend({
  layout,
  tagName: '',
  motionService: Ember.inject.service('-ea-motion'),
  duration: 2000,

  init() {
    this._elementToChild = new WeakMap();
    this._prevItems = [];
    this._firstTime = true;
    this._inserted = false;
    this._renderedChildren = [];
    this._cycleCounter = 0;
    this.get('motionService').register(this);
    this._super();
  },

  renderedChildren: Ember.computed('items.[]', function() {
    let getKey = this.get('keyGetter');
    let oldChildren = this._renderedChildren;
    let newItems = this.get('items');

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

  willDestroyElement() {
    let removedSprites = [];
    for (let element of this._ownElements()) {
      let sprite = new Sprite(element);
      sprite.owner = this._elementToChild.get(element);
      sprite.measureInitialBounds();
      removedSprites.push(sprite);
    }
    this.get('motionService.farMatch').perform([], removedSprites);
    this.get('motionService').unregister(this);
  },

  didReceiveAttrs() {
    let prevItems = this._prevItems;
    let items = this.get('items') || [];
    this._prevItems = items.slice();

    let firstTime = this._firstTime;
    this._firstTime = false;

    let transition = this._transitionFor(firstTime, prevItems, items);
    this.set('willTransition', !!transition);
    if (!transition) { return; }

    this._notifyContainer('lock');

    let currentSprites = [];
    for (let element of this._ownElements()) {
      let sprite = new Sprite(element);
      sprite.measureInitialBounds();
      currentSprites.push(sprite);
    }
    // this needs to be separate from the previous loop -- we need to
    // measure all of them before we start locking any of them
    currentSprites.forEach(sprite => sprite.lock());
    this.get('animate').perform(currentSprites, transition);
  },

  animate: task(function * (currentSprites, transition) {
    yield afterRender();

    let keptSprites = [];
    let removedSprites = [];

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
      default:
        Ember.warn(`Probable bug in ember-animated: saw unexpected child state ${child.state}`, false, { id: "ember-animated-state" });
      }
    });

    // Briefly go into final static layout
    keptSprites.forEach(sprite => sprite.unlock());
    removedSprites.forEach(sprite => sprite.display(false));

    // so we can measure it
    let insertedSprites = [];
    for (let element of this._ownElements()) {
      if (!currentSprites.find(sprite => sprite.element === element)) {
        let sprite = new Sprite(element);
        sprite.owner = this._elementToChild.get(element);
        sprite.hide();
        insertedSprites.push(sprite);
      }
    }
    insertedSprites.forEach(sprite => sprite.measureFinalBounds());
    keptSprites.forEach(sprite => sprite.measureFinalBounds());
    this._notifyContainer('measure', { duration: this.get('duration') });

    // Then lock everything down
    keptSprites.forEach(sprite => sprite.lock());
    insertedSprites.forEach(sprite => sprite.lock());
    removedSprites.forEach(sprite => sprite.display(true));

    let farMatches = yield this.get('motionService.farMatch').perform(insertedSprites, removedSprites);

    // any removed sprites that matched elsewhere will get handled elsewhere
    let unmatchedRemovedSprites = removedSprites.filter(sprite => {
      if (farMatches.get(sprite)) {
        sprite.hide();
        return false;
      } else {
        return true;
      }
    })

    let context = new TransitionContext(
      this.get('duration'),
      insertedSprites,
      keptSprites,
      unmatchedRemovedSprites,
      farMatches
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

    removedSprites.forEach(sprite => sprite.owner.flagForRemoval());

    if (removedSprites.length > 0) {
      // trigger a rerender to reap our removed children
      this.propertyDidChange('renderedChildren');
    }

    this._notifyContainer('unlock');
  }).restartable(),

  _motionStarted(sprite, cycle) {
    sprite.reveal();
    sprite.owner.block(cycle);
  },

  _motionEnded(sprite, cycle) {
    sprite.owner.unblock(cycle);
  },

  _notifyContainer(method, opts) {
    var target = this.get('notify');
    if (target && target[method]) {
      return target[method](opts);
    }
  },

  _transitionFor(firstTime, oldItems, newItems) {
    let rules = this.get('rules');
    if (!rules) {
      return null;
    }
    return rules(firstTime, oldItems, newItems);
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
