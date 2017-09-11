import Ember from 'ember';

export default Ember.Controller.extend({
  tableMode: false,
  actions: {
    toggle() {
      this.set('tableMode', !this.get('tableMode'));
    }
  }
});
