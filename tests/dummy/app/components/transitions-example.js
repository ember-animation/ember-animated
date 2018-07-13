//BEGIN-SNIPPET transitions-snippet.js
import Component from '@ember/component';
import fade from 'ember-animated/transitions/fade';
import { moveOver, toUp, toDown } from 'ember-animated/transitions/move-over';
import move from 'ember-animated/motions/move';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';

export default Component.extend({
  fade,
  moveOver,
  toUp,
  toDown,

  moveOverMessage: false,
  fadeMessage: false,
  custom: false,

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

  mail: "Hello",

});
//END-SNIPPET