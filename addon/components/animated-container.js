import Ember from 'ember';
import layout from '../templates/components/animated-container';
import Resize from '../motions/resize';
import { task } from 'ember-concurrency';
import { Promise } from '../concurrency-helpers';
import Sprite from '../sprite';

export default Ember.Component.extend({
  layout,
  classNames: ['animated-container'],
  motionService: Ember.inject.service('-ea-motion'),

  init() {
    this._super();
    this._signals = null;
    this._signalPromise = null;
    this._signalResolve= null;
    this.get('motionService').register(this);
  },

  willDestroyElement() {
    this.get('motionService').unregister(this);
  },

  isAnimating: Ember.computed.alias('animate.isRunning'),

  animate: task(function * () {
    yield* this.waitForSignal('measured');
    yield* new (this.motion || Resize)(this.sprite).run();
    yield* this.waitForSignal('unlock');
    this.sprite.unlock();
  }).restartable(),

  resetSignals() {
    this._signals = [];
  },

  receivedSignal(name) {
    if (!this._signals) { return; }
    this._signals.push(name);
    let s = this._signalResolve;
    this._signalResolve = null;
    this._signalPromise = null;
    if (s) {
      s();
    }
  },

  waitForSignal: function * (name) {
    while (this._signals.indexOf(name) < 0) {
      if (!this._signalPromise) {
        this._signalPromise = new Promise(resolve => {
          this._signalResolve = resolve;
        });
      }
      yield this._signalPromise;
    }
  },

  actions: {
    lock() {
      let sprite = new Sprite(this.element, this, true);
      this.sprite = sprite;
      this.resetSignals();
      sprite.measureInitialBounds();
      sprite.lock();
      this.get('animate').perform();
    },
    measure() {
      if (this.sprite) {
        this.sprite.unlock();
        this.sprite.measureFinalBounds();
        this.sprite.lock();
      }
      this.receivedSignal('measured');
    },
    unlock() {
      this.receivedSignal('unlock');
    }
  }
});
