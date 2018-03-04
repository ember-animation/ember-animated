import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { Resize } from '../motions/resize';
import { task } from '../-private/ember-scheduler';
import Sprite from '../-private/sprite';
import { afterRender, microwait } from '..';

export default Component.extend({
  classNames: ['animated-container'],
  motionService: service('-ea-motion'),
  onInitialRender: false,

  init() {
    this._super();
    this._signals = null;
    this._signalPromise = null;
    this._signalResolve= null;
    this._inserted = false;
    this._startingUp = false;
    this.maybeAnimate = this.maybeAnimate.bind(this);
    this.get('motionService')
      .register(this)
      .observeDescendantAnimations(this, this.maybeAnimate);
  },

  didInsertElement() {
    this._inserted = true;
  },

  willDestroyElement() {
    this.get('motionService')
      .unregister(this)
      .unobserveDescendantAnimations(this, this.maybeAnimate);
  },

  isAnimating: alias('animate.isRunning'),

  maybeAnimate({ duration, task }) {
    if (!this._startingUp) {
      this.get('animate').perform(duration, task);
    }
  },

  beginStaticMeasurement() {
    if (this.sprite) {
      this.sprite.unlock();
    }
  },

  endStaticMeasurement() {
    if (this.sprite) {
      this.sprite.lock();
    }
  },

  animate: task(function * (duration, animationTask) {
    this._startingUp = true;
    let service = this.get('motionService');
    let sprite;
    let useMotion;

    if (this._inserted){
      sprite = Sprite.sizedStartingAt(this.element);
      this.sprite = sprite;
      sprite.lock();
      useMotion = true;
    } else {
      useMotion = this.get('onInitialRender');
    }

    try {
      yield afterRender();
      yield microwait();
    } finally {
      this._startingUp = false;
    }

    yield * service.staticMeasurement(() => {
      if (!sprite) {
        sprite = Sprite.sizedEndingAt(this.element);
        this.sprite = sprite;
      } else {
        sprite.measureFinalBounds();
      }
    });

    if (useMotion) {
      yield* new (this.motion || Resize)(this.sprite, { duration })._run();
    }

    yield animationTask;

    this.sprite.unlock();
    this.sprite = null;
  }).restartable()
});
