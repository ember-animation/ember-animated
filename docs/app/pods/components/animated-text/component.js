import Component from '@ember/component';
import move from 'ember-animated/motions/move';

export default Component.extend({
  tagName: '',
  transition: function * ({ sentSprites }) {
    sentSprites.forEach(move);
  }
}).reopenClass({
  positionalParams: ['text']
});
