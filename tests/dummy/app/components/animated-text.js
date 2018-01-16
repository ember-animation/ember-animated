import Component from '@ember/component';
import Move from 'ember-animated/motions/move';

export default Component.extend({
  tagName: '',
  transition,
}).reopenClass({
  positionalParams: ['text']
});

function * transition() {
  this.sentSprites.forEach(sprite => this.animate(new Move(sprite)));
}
