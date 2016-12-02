import { task } from 'ember-concurrency';
import { rAF } from './concurrency-helpers';
import Ember from 'ember';

const motions = new WeakMap();

export default Ember.Object.extend({
  init() {
    this._super(...arguments);
    this._setupMotionList();
  },

  // --- Begin Hooks you should Implement ---

  // Here you can inspect the other motions on this element that have
  // been interrupted during this frame. You should save any state on
  // `this` in order to influence your own animation. This hook is
  // skipped if there were no other motions.
  interrupted(/* motions */) {
  },

  // Start your animation here. It should be a cancelable task if you
  // want to be able to interrupt it.
  animate: task(function * () {
  }),


  // --- Begin public methods you may call ---

  cancel() {
    this.get('_run').cancelAll();
  },

  run() {
    return this.get('_run').perform();
  },

  join() {
    return this.get('_run.last');
  },

  // --- Begin private methods ---

  _setupMotionList() {
    let element = this.sprite.element;
    let motionList = motions.get(element);
    if (!motionList) {
      motions.set(element, motionList = []);
    }
    motionList.unshift(this);
    this._motionList = motionList;
  },

  _clearMotionList() {
    let index = this._motionList.indexOf(this);
    this._motionList.splice(index, 1);
    if (this._motionList.length === 0) {
      motions.delete(this.sprite.element);
    }
  },

  _run: task(function * (){
    try {
      let others = this._motionList.filter(m => m !== this);
      if (others.length > 0) {
        this.interrupted(others);
      }
      yield this.get('animate').perform();
    } finally {
      rAF().then(() => this._clearMotionList());
    }
  })
}).reopenClass({
  create(sprite, opts={}) {
    return this._super({ sprite, opts });
  }
});
