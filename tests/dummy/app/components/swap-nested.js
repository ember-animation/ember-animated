import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import resize from 'ember-animated/motions/resize';

export default Component.extend({
  showLeft: true,

  outerBox: function * ({ sentSprites }) {
    sentSprites.forEach(sprite => {
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

  actions: {
    swap() {
      this.set('showLeft', !this.showLeft);
    }
  }
});
