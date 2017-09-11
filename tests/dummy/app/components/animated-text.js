import Ember from 'ember';
import Move from 'ember-animated/motions/move';

export default Ember.Component.extend({
  tagName: '',
  transition,
}).reopenClass({
  positionalParams: ['text']
});

function * transition() {
  this.keptSprites.forEach(sprite => this.animate(new Move(sprite)));
}
