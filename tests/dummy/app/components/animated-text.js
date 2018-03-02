import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import always from 'ember-animated/rules/always';

export default Component.extend({
  always,
  tagName: '',
  transition,
}).reopenClass({
  positionalParams: ['text']
});

function * transition({ sentSprites }) {
  sentSprites.forEach(move);
}
