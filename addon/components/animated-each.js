import Ember from 'ember';
import layout from '../templates/components/animated-each';
import { task } from 'ember-concurrency';
import { afterRender } from '../concurrency-helpers';
import TransitionContext from '../transition-context';
import Sprite from '../sprite';
import { componentNodes } from 'ember-animated/ember-internals';

export default Ember.Component.extend({
  layout,
  tagName: '',
  motionService: Ember.inject.service('-ea-motion'),
  duration: 2000,

  init() {
    this._elementToItem = new WeakMap();
    this._prevItems = [];
    this._firstTime = true;
    this._inserted = false;
    this.get('motionService').register(this);
    this._super();
  },

  isAnimating: Ember.computed.alias('animate.isRunning'),

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

  didInsertElement() {
    this._inserted = true;
  },

  animate: task(function * (currentSprites, transition) {
    yield afterRender();

    let [keptSprites, removedSprites] = partition(
      currentSprites,
      sprite => !sprite.isMarkedForDestruction() && !!sprite.element.parentElement
    );

    removedSprites.forEach(sprite => sprite.markedForDestruction());

    // Briefly unlock everybody
    keptSprites.forEach(sprite => sprite.unlock());

    // so we can measure the final static layout
    let insertedSprites = [];
    for (let element of this._ownElements()) {
      if (!currentSprites.find(sprite => sprite.element === element)) {
        let sprite = new Sprite(element);
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

    let farMatches = yield this.get('motionService.farMatch').perform(insertedSprites, removedSprites);

    // any removed sprites that matched elsewhere will get handled elsewhere
    removedSprites = removedSprites.filter(sprite => !farMatches.get(sprite))

    let context = new TransitionContext(this.get('duration'), insertedSprites, keptSprites, removedSprites, farMatches);
    yield * context._runToCompletion(transition);

    this._notifyContainer('unlock');
  }).restartable(),

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


function partition(list, pred) {
  let matched = [];
  let unmatched = [];
  list.forEach(entry => {
    if (pred(entry)) {
      matched.push(entry);
    } else {
      unmatched.push(entry);
    }
  });
  return [matched, unmatched];
}
