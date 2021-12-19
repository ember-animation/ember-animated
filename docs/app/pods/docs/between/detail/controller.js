/* eslint-disable require-yield */
//BEGIN-SNIPPET between-detail-snippet.js
import Controller from '@ember/controller';
import move, { continuePrior } from 'ember-animated/motions/move';
import scale from 'ember-animated/motions/scale';
import opacity from 'ember-animated/motions/opacity';
import { parallel, printSprites } from 'ember-animated';

export default class extends Controller {
  /* Sets scroll position so that the demo animates between routes without
  scrolling to the top of the page every time, see scroll-to-top */
  preserveScrollPosition = true;

  *transition({ receivedSprites, sentSprites, removedSprites }) {
    printSprites(arguments[0]);
    // received and sent sprites are flying above all the others
    receivedSprites.concat(sentSprites).forEach((sprite) => {
      sprite.applyStyles({
        'z-index': '1',
      });
    });

    receivedSprites.forEach(parallel(move, scale));
    sentSprites.forEach(parallel(move, scale));

    removedSprites.forEach((sprite) => {
      sprite.endTranslatedBy(0, 0);
      continuePrior(sprite);
      opacity(sprite, { to: 0 });
    });
  }
}
//END-SNIPPET
