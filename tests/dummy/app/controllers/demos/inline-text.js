import Controller from '@ember/controller';
import fade from 'ember-animated/transitions/fade';

export default Controller.extend({
  tableMode: false,
  fade,

  actions: {
    toggle() {
      this.set('tableMode', !this.get('tableMode'));
    }
  }
});
