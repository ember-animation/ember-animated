/* if changes are made here please also reflect them in
the comments in the docs */
import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';

export default Component.extend({
  showThing: false,

  toggleThing() {
    this.set('showThing', !this.get('showThing'));
  },

  transition: function* ({ insertedSprites, keptSprites, removedSprites }) {
    insertedSprites.forEach((sprite) => {
      sprite.startAtPixel({ x: window.innerWidth });
      move(sprite, { easing: easeOut });
    });

    keptSprites.forEach(move);

    removedSprites.forEach((sprite) => {
      sprite.endAtPixel({ x: window.innerWidth });
      move(sprite, { easing: easeIn });
    });
  },
});
