import Component from '@ember/component';
import { move } from 'ember-animated/motions/move';

export default Component.extend({
  tagName: '',
  transition,
}).reopenClass({
  positionalParams: ['text']
});

function * transition({ sentSprites }) {
  sentSprites.forEach(move);
}
