//BEGIN-SNIPPET rules-snippet.js
import Component from '@ember/component';
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
  actions: {
    increment() {
      this.set('counter', this.get('counter') + 1);
    },
    decrement() {
      this.set('counter', this.get('counter') - 1);
    },
  },
});
//END-SNIPPET
