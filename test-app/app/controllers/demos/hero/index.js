import Controller from '@ember/controller';
import opacity from 'ember-animated/motions/opacity';

export default class extends Controller {
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
