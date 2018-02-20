import Controller from '@ember/controller';
import { computed } from "@ember/object"
import { not } from "@ember/object/computed"
import move from 'ember-animated/motions/move';
import { printSprites } from 'ember-animated/debug';

export default Controller.extend({
  showLeft: true,
  showRight: not('showLeft'),
  transition,
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

function * transition({ receivedSprites }) {
  printSprites(arguments[0]);
  receivedSprites.forEach(move);
}
