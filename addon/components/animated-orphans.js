import Ember from 'ember';
import layout from '../templates/components/animated-orphans';
import { task } from '../ember-scheduler';
import { afterRender } from '../concurrency-helpers';
import TransitionContext from '../transition-context';
import { spawnChild, childrenSettled } from '../scheduler';
import Sprite from '../sprite';

export default Ember.Component.extend({
  layout,
  classNames: ['animated-orphans'],
  motionService: Ember.inject.service('-ea-motion'),

  init() {
    this._super();
    this._newOrphanTransitions = [];
    this._elementToChild = new WeakMap();
    this._childToTransition = new WeakMap();
    this._inserted = false;
    this._cycleCounter = 0;

  },

  didInsertElement() {
    this._inserted = true;
    this.animateOrphans = this.animateOrphans.bind(this);
    this.reanimate = this.reanimate.bind(this);
    this.get("motionService")
      .register(this)
      .observeOrphans(this.animateOrphans)
      .observeAnimations(this.reanimate);
  },

  willDestroyElement() {
    this.get("motionService")
      .unregister(this)
      .unobserveOrphans(this.animateOrphans)
      .unobserveAnimations(this.reanimate);
  },

  animateOrphans(removedSprites, transition, duration) {
    this._newOrphanTransitions.push({ removedSprites, transition, duration });
    this.get('startAnimation').perform();
  },

  reanimate() {
    this.get('startAnimation').perform();
  },

  beginStaticMeasurement() {
    // we don't have any impact on static layout
  },

  endStaticMeasurement() {},

  isAnimating: Ember.computed.or('startAnimation.isRunning', 'animate.isRunning'),

  startAnimation: task(function * () {
    yield afterRender();
    let ownSprite = new Sprite(this.element, true, null, null);
    let activeSprites = this._findActiveSprites(ownSprite);
    this.get('animate').perform(activeSprites, ownSprite);
  }).drop(),

  animate: task(function * (activeSprites, ownSprite) {
    // we don't need any static measurements, but we wait for this so
    // we stay on the same timing as all the other animators
    yield * this.get('motionService').staticMeasurement(() => {});

    // our sprites from prior animation runs are eligible to be
    // matched by other animators (this is how an orphan sprites that
    // are animating away can get interrupted into coming back)
    let farMatches = yield this.get('motionService.farMatch').perform([], [], activeSprites);

    activeSprites = activeSprites.filter(sprite => {
      if (farMatches.get(sprite)) {
        sprite.hide();
        return false;
      } else {
        return true;
      }
    });

    let cycle = this._cycleCounter++;

    for (let { transition, duration, sprites } of this._groupActiveSprites(activeSprites)) {
      let context = new TransitionContext(
        duration,
        [],
        [],
        sprites
      );
      context.onMotionStart = this._onMotionStart.bind(this, cycle);
      context.onMotionEnd = this._onMotionEnd.bind(this, cycle);
      spawnChild(function * () {
        yield * context._runToCompletion(transition);
      });
    }

    while (this._newOrphanTransitions.length > 0) {
      let entry = this._newOrphanTransitions.shift();
      let { transition, duration, removedSprites } = entry;
      let context = new TransitionContext(
        duration,
        [],
        [],
        removedSprites
      );
      for (let sprite of removedSprites) {
        sprite.rehome(ownSprite);
        this._childToTransition.set(sprite.owner, entry);
      }
      context.onMotionStart = this._onFirstMotionStart.bind(this, activeSprites, cycle);
      context.onMotionEnd = this._onMotionEnd.bind(this, cycle);
      spawnChild(function * () {
        yield * context._runToCompletion(transition);
      });
    }

    yield childrenSettled();
    for (let sprite of activeSprites) {
      sprite.element.remove();
    }
  }).restartable(),

  _findActiveSprites(ownSprite) {
    if (!this._inserted) { return []; }
    return [...this.element.children].map(element => {
      let child = this._elementToChild.get(element);
      if (child.shouldRemove) {
        // child was not animating in the previously interrupted
        // animation, so its safe to remove
        element.remove();
      } else {
        let sprite = Sprite.positionedStartingAt(element, ownSprite);
        sprite.owner = child;
        return sprite;
      }
    }).filter(Boolean);
  },

  _groupActiveSprites(activeSprites) {
    let groups = [];
    for (let sprite of activeSprites) {
      let { transition, duration } = this._childToTransition.get(sprite.owner);
      let group = groups.find(g => g.transition === transition);
      if (!group) {
        group = { transition, duration, sprites: []};
        groups.push(group);
      }
      group.sprites.push(sprite);
    }
    return groups;
  },

  _onFirstMotionStart(activeSprites, cycle, sprite) {
    if (activeSprites.indexOf(sprite) === -1) {
      if (inDOM(sprite.element)) {
        sprite.element = sprite.element.cloneNode(true);
      }
      sprite.lock();
      this.element.appendChild(sprite.element);
      activeSprites.push(sprite);
      this._elementToChild.set(sprite.element, sprite.owner);
      sprite.owner.flagForRemoval();
    }
    sprite.owner.block(cycle);
  },

  _onMotionStart(cycle, sprite) {
    sprite.owner.block(cycle);
  },

  _onMotionEnd(cycle, sprite) {
    sprite.owner.unblock(cycle);
  }

});

function inDOM(element) {
  let pointer = element;
  while (true) {
    if (!pointer) {
      return false;
    }
    if (pointer.tagName === 'BODY') {
      return true;
    }
    pointer = pointer.parentElement;
  }
}
