import Controller from '@ember/controller';
import move from 'ember-animated/motions/move';
import scale from 'ember-animated/motions/scale';
import opacity from 'ember-animated/motions/opacity';
import { parallel } from 'ember-animated';

export default Controller.extend({
  showingModal: false,

  transition: function * ({ receivedSprites, sentSprites }) {
    receivedSprites.forEach(parallel(scale, move));
    sentSprites.forEach(parallel(scale, move, opacity));
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
