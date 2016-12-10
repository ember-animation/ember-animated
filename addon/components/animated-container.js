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
    this._inserted = false;
    this.get('motionService').register(this);
  },

  didInsertElement() {
    this._inserted = true;
  },

  willDestroyElement() {
    this.get('motionService').unregister(this);
  },

  isAnimating: Ember.computed.alias('animate.isRunning'),

  animate: task(function * () {
    let opts = yield* this.waitForSignal('measured');
    yield* new (this.motion || Resize)(this.sprite, opts)._run();
    yield* this.waitForSignal('unlock');
    this.sprite.unlock();
  }).restartable(),

  resetSignals() {
    this._signals = [];
  },

  receivedSignal(name, opts) {
    if (!this._signals) { return; }
    this._signals.push({name, opts});
    let s = this._signalResolve;
    this._signalResolve = null;
    this._signalPromise = null;
    if (s) {
      s();
    }
  },

  waitForSignal: function * (name) {
    let signal;
    while (!(signal = this._signals.find(s => s.name === name))) {
      if (!this._signalPromise) {
        this._signalPromise = new Promise(resolve => {
          this._signalResolve = resolve;
        });
      }
      yield this._signalPromise;
    }
    return signal.opts;
  },

  actions: {
    lock() {
      if (!this._inserted){ return; }
      let sprite = new Sprite(this.element, this, true);
      this.sprite = sprite;
      this.resetSignals();
      sprite.measureInitialBounds();
      sprite.lock();
      this.get('animate').perform();
    },
    measure(opts) {
      if (this.sprite) {
        this.sprite.unlock();
        this.sprite.measureFinalBounds();
        this.sprite.lock();
      }
      this.receivedSignal('measured', opts);
    },
    unlock() {
      this.receivedSignal('unlock');
    }
  }
});
