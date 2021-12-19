//BEGIN-SNIPPET rules-snippet.js
import Component from '@ember/component';
import { action } from '@ember/object';
import { toUp, toDown } from 'ember-animated/transitions/move-over';

export default Component.extend({
  rules({ oldItems, newItems }) {
    if (oldItems[0] < newItems[0]) {
      return toDown;
    } else {
      return toUp;
    }
  },

  counter: 20,

  increment: action(function () {
    this.set('counter', this.counter + 1);
  }),

  decrement: action(function () {
    this.set('counter', this.counter - 1);
  }),
});
//END-SNIPPET
