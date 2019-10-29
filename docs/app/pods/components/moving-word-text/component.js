//BEGIN-SNIPPET moving-word-text-snippet.js
import Component from '@ember/component';
import fade from 'ember-animated/transitions/fade';

export default Component.extend({
  listMode: false,
  fade,

  actions: {
    toggle() {
      this.set('listMode', !this.get('listMode'));
    },
    normal() {
      this.set('noAdjustments', !this.get('noAdjustments'));
    },
  },
});
//END-SNIPPET
