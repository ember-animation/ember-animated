import Controller from '@ember/controller';
import move, { continuePrior } from 'ember-animated/motions/move';
import scale from 'ember-animated/motions/scale';
import opacity from 'ember-animated/motions/opacity';
import { parallel } from 'ember-animated';

export default Controller.extend({
  transition: function * ({ receivedSprites, sentSprites, removedSprites }) {

    // received and sent sprites are flying above all the others
    receivedSprites.concat(sentSprites).forEach(sprite => {
      sprite.applyStyles({
        'z-index': 1
      });
    });

    receivedSprites.forEach(parallel(move, scale));
    sentSprites.forEach(parallel(move, scale));

    removedSprites.forEach(sprite => {
      sprite.endTranslatedBy(0, 0);
      continuePrior(sprite);
      opacity(sprite, { to: 0 });
    });
  }


});
