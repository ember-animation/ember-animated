//BEGIN-SNIPPET moving-word-text-snippet.js
import Component from '@ember/component';
import fade from 'ember-animated/transitions/fade';

export default Component.extend({
  tableMode: false,
  fade,

  actions: {
    toggle() {
      this.set('tableMode', !this.get('tableMode'));
    },
    normal(){
      this.set('noAdjustments', !this.get('noAdjustments'));
    }
  }
});
//END-SNIPPET