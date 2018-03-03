import Controller from '@ember/controller';
import { computed } from "@ember/object"
import { not } from "@ember/object/computed"
import move from 'ember-animated/motions/move';

export default Controller.extend({
  showLeft: true,
  showRight: not('showLeft'),

  transition: function * ({ receivedSprites }) {
    receivedSprites.forEach(move);
  },

  howToGroup: computed('groupTogether', function() {
    if (this.get('groupTogether')) {
      return 'together';
    }
  }),
  actions: {
    toggle() {
      this.set('showLeft', !this.get('showLeft'));
    }
  }
});
