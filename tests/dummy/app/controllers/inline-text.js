import Ember from 'ember';
import Move from 'ember-animated/motions/move';

export default Ember.Controller.extend({
  tableMode: false,
  transition,
  actions: {
    toggle() {
      this.set('tableMode', !this.get('tableMode'));
    }
  }
});

function * transition() {
  this.keptSprites.forEach(sprite => this.animate(new Move(sprite)));
}
