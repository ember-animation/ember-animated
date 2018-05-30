/* if changes are made here please also reflect them in
the comments in the docs */
import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import scale from 'ember-animated/motions/scale';
import { parallel } from 'ember-animated';

export default Component.extend({
  showThing: false,

  transition: function * ({ receivedSprites, sentSprites }) {
    receivedSprites.forEach(parallel(scale, move));
    sentSprites.forEach(parallel(scale, move));
  },

  actions: {
    launch() {
      this.set('showThing', true);
    },
    dismiss() {
      this.set('showThing', false);
    }
  }
});