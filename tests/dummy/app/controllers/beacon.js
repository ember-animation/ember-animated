import Controller from '@ember/controller';
import move from 'ember-animated/motions/move';
import scale from 'ember-animated/motions/scale';

export default Controller.extend({
  showingModal: false,

  transition: function * ({ receivedSprites, sentSprites }) {
    receivedSprites.forEach(sprite => {
      sprite.scale(sprite.initialBounds.width / sprite.finalBounds.width, sprite.initialBounds.height / sprite.finalBounds.height);
      scale(sprite);
      move(sprite);
    });

    sentSprites.forEach(sprite => {
      scale(sprite);
      move(sprite);
    });
  },

  actions: {
    launch() {
      this.set('showingModal', true);
    },
    dismiss() {
      this.set('showingModal', false);
    }
  }
});
