import Ember from 'ember';
import layout from '../templates/components/animated-orphans';
import { task } from '../ember-scheduler';
import { afterRender, microwait } from '../concurrency-helpers';
import TransitionContext from '../transition-context';
import { spawnChild, childrenSettled, current } from '../scheduler';
import Sprite from '../sprite';
import partition from '../partition';

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
    this.reanimate();
  },

  reanimate() {
    if (!this.get('startAnimation.isRunning')) {
      let ownSprite = new Sprite(this.element, true, null, null);
      let activeSprites = this._findActiveSprites(ownSprite);
      this.get('animate').perform({ ownSprite, activeSprites });
    }
  },

  beginStaticMeasurement() {
    // we don't have any impact on static layout
  },

  endStaticMeasurement() {},

  isAnimating: Ember.computed.alias('animate.isRunning'),

  animate: task(function * ({ ownSprite, activeSprites }) {
    yield this.get('startAnimation').perform(ownSprite);
    let { matchingAnimatorsFinished } = yield this.get('runAnimation').perform(activeSprites, ownSprite);
    yield this.get('finalizeAnimation').perform(activeSprites, matchingAnimatorsFinished);
  }).restartable(),

  startAnimation: task(function * (ownSprite) {
    yield afterRender();
    ownSprite.measureFinalBounds();
  }),

  runAnimation: task(function * (activeSprites, ownSprite) {
    // we don't need any static measurements, but we wait for this so
    // we stay on the same timing as all the other animators
    yield * this.get('motionService').staticMeasurement(() => {});

    // our sprites from prior animation runs are eligible to be
    // matched by other animators (this is how an orphan sprites that
    // are animating away can get interrupted into coming back)
    let { farMatches, matchingAnimatorsFinished } = yield this.get('motionService.farMatch').perform(
      current(),
      [],
      [],
      activeSprites.concat(...this._newOrphanTransitions.map(t => t.removedSprites))
    );

    let cycle = this._cycleCounter++;

    for (let { transition, duration, sprites } of this._groupActiveSprites(activeSprites)) {
      let [sentSprites, removedSprites] = partition(sprites, sprite => {
        let other = farMatches.get(sprite);
        if (other) {
          sprite.endAtSprite(other);
          if (other.revealed && !sprite.revealed) {
            sprite.startAtSprite(other);
          }
          return true;
        }
      });
      let context = new TransitionContext(
        duration,
        [],
        [],
        removedSprites,
        sentSprites,
        []
      );
      context.onMotionStart = this._onMotionStart.bind(this, cycle);
      context.onMotionEnd = this._onMotionEnd.bind(this, cycle);
      spawnChild(function * () {
        // let other animators make their own partitioning decisions
        // before we start hiding the sent & received sprites yield
        yield microwait();
        sentSprites.forEach(s => s.hide());
        yield * context._runToCompletion(transition);
      });
    }

    while (this._newOrphanTransitions.length > 0) {
      let entry = this._newOrphanTransitions.shift();
      let { transition, duration, removedSprites } = entry;
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

      let context = new TransitionContext(
        duration,
        [],
        [],
        unmatchedRemovedSprites,
        sentSprites,
        []
      );
      for (let sprite of removedSprites) {
        sprite.rehome(ownSprite);
        this._childToTransition.set(sprite.owner, entry);
      }
      context.onMotionStart = this._onFirstMotionStart.bind(this, activeSprites, cycle);
      context.onMotionEnd = this._onMotionEnd.bind(this, cycle);
      spawnChild(function * () {
        yield microwait();
        sentSprites.forEach(s => s.hide());
        yield * context._runToCompletion(transition);
      });
    }

    yield childrenSettled();
    return { matchingAnimatorsFinished };
  }),

  finalizeAnimation: task(function * (activeSprites, matchingAnimatorsFinished) {
    yield matchingAnimatorsFinished;
    for (let sprite of activeSprites) {
      sprite.element.remove();
    }
  }),

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
      sprite.reveal();
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
