//BEGIN-SNIPPET transitions-snippet.js
import Component from '@ember/component';
import fade from 'ember-animated/transitions/fade';
import move from 'ember-animated/motions/move';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';

export default Component.extend({
  fade,
  custom: false,
  mail: "Hello",

  /* custom transition */
  slideFromSide: function * (context) {
    let { insertedSprites, keptSprites, removedSprites } = context;
    insertedSprites.forEach(sprite => {
      sprite.startAtPixel({ x: window.innerWidth });
      move(sprite, { easing: easeOut });
    });

    keptSprites.forEach(move);

    removedSprites.forEach(sprite => {
      sprite.endAtPixel({ x: window.innerWidth });
      move(sprite, { easing: easeIn });
    });
  },

});
//END-SNIPPET