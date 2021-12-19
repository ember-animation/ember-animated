/* eslint-disable require-yield */
//BEGIN-SNIPPET index-snippet.js
import Controller from '@ember/controller';
import opacity from 'ember-animated/motions/opacity';

export default class extends Controller {
  /* Sets scroll position so that the demo animates between routes without
  scrolling to the top of the page every time, see scroll-to-top */
  preserveScrollPosition = true;

  *transition({ insertedSprites, receivedSprites, removedSprites }) {
    insertedSprites.forEach((sprite) => {
      opacity(sprite, { from: 0, to: 1 });
    });

    receivedSprites.forEach((sprite) => {
      opacity(sprite, { to: 1 });
    });

    removedSprites.forEach((sprite) => {
      opacity(sprite, { to: 0 });
    });
  }
}
//END-SNIPPET
