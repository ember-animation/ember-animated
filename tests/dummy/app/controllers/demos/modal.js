import Controller from '@ember/controller';
import opacity from 'ember-animated/motions/opacity';
import move from 'ember-animated/motions/move';
import faker from 'faker';

export default Controller.extend({
  message: '',
  lastMessage: '',

  showMessage(m) {
    this.set('lastMessage', this.message);
    this.set('message', m);
  },

  showRandomMessage() {
    this.showMessage(`Hello ${faker.name.firstName()}`);
  },

  showPreviousMessage() {
    this.showMessage(this.lastMessage);
  },

  *backgroundTransition({ removedSprites, insertedSprites, receivedSprites }) {
    insertedSprites.concat(receivedSprites).forEach((sprite) => {
      sprite.applyStyles({ 'pointer-events': '' });

      // this animates them to their natural opacity, which is determined by our
      // stylesheet.
      opacity(sprite);
    });

    // and this fades to zero opacity
    removedSprites.forEach((sprite) => {
      sprite.applyStyles({ 'pointer-events': 'none' });
      opacity(sprite, { to: 0 });
    });
  },

  *dialogTransition({ removedSprites, insertedSprites, receivedSprites }) {
    insertedSprites.forEach((sprite) => {
      sprite.startAtPixel({ x: -sprite.finalBounds.width });
      move(sprite);
    });
    receivedSprites.forEach(move);
    removedSprites.forEach((sprite) => {
      sprite.endAtPixel({ x: window.outerWidth });
      move(sprite);
    });
  },
});
