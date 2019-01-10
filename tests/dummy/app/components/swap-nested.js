import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import resize from 'ember-animated/motions/resize';
import opacity from 'ember-animated/motions/opacity';
import { wait } from 'ember-animated';

export default Component.extend({
  showLeft: true,

  outerBox: function * ({ receivedSprites }) {
    receivedSprites.forEach(sprite => {
      move(sprite);
      resize(sprite);
    });
  },

  logo: function * ({ sentSprites }) {
    sentSprites.forEach(sprite => {
      sprite.applyStyles({ 'z-index': 1 });
      move(sprite);
    });
  },

  boxContents: function * ({ receivedSprites, sentSprites, duration }) {
    sentSprites.forEach(sprite => {
      move(sprite);
      opacity(sprite, { to: 0, duration: duration * 0.2 });
      sprite.applyStyles({ 'z-index': 1 });
    });
    receivedSprites.forEach(sprite => {

      // receivedSprites are moved by default to start at their matched sprite.
      // But in our case, we just want to site in our own position and only
      // touch opacity (no position changes). So here we are jumping to our real
      // final position immediately.
      let diff = sprite.difference('finalBounds', sprite, 'initialBounds');
      sprite.translate(diff.dx, diff.dy);

      sprite.applyStyles({ opacity: 0 });
    });

    if (receivedSprites.length > 0) {
      yield wait(duration * 0.8);
      receivedSprites.forEach(sprite => {
        opacity(sprite, { from: 0, to: 1, duration: duration * 0.2 });
      });
    }
  },

  actions: {
    swap() {
      this.set('showLeft', !this.showLeft);
    }
  }
});
