//BEGIN-SNIPPET transitions-moveover-snippet.js
import Component from '@ember/component';
import { toLeft, toRight } from 'ember-animated/transitions/move-over';

export default Component.extend({
  init() {
    this._super();
    this.words = ['hello', 'goodbye'];
    this.message = ['hello'];
  },

  toLeft,
  toRight,
  counter: 1,
  showHello: false,

  rules({ newItems }) {
    if (newItems[0]) {
      return toRight;
    } else {
      return toLeft;
    }
  },
});
//END-SNIPPET
