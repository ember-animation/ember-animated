//BEGIN-SNIPPET moving-word-snippet.js
import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import adjustCSS from 'ember-animated/motions/adjust-css';
import adjustColor from 'ember-animated/motions/adjust-color';
import compensateForScale from 'ember-animated/motions/compensate-for-scale';
import { parallel } from 'ember-animated';

export default Component.extend({
  tagName: '',
  duration: 1000,

  init() {
    this._super();
    this.transition = this.transition.bind(this);
  },

  motions() {
    let motions = [];
    if (!this.disableMove) {
      motions.push(move);
    }
    if (!this.disableCompensateForScale) {
      motions.push(compensateForScale);
    }
    if (!this.disableAdjustFontSize) {
      motions.push(adjustCSS.property('font-size'));
    }
    if (!this.disableAdjustLetterSpacing) {
      motions.push(adjustCSS.property('letter-spacing'));
    }
    if (!this.disableAdjustColor) {
      motions.push(adjustColor.property('color'));
    }
    return motions;
  },

  transition: function* ({ sentSprites }) {
    let motions = this.motions();
    sentSprites.forEach(parallel(...motions));
  },
});
//END-SNIPPET
