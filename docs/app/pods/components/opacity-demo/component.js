//BEGIN-SNIPPET opacity-demo-snippet.js
import Component from '@ember/component';
import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';

export default Component.extend({
  fadeMessage: false,
  mail: 'Hello',

  transition: function* ({ insertedSprites, removedSprites }) {
    insertedSprites.forEach(fadeIn);
    removedSprites.forEach(fadeOut);
  },
});
//END-SNIPPET
