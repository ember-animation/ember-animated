import Controller from '@ember/controller';
import { computed } from "@ember/object"
import { not } from "@ember/object/computed"
import Move from 'ember-animated/motions/move';

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

function * transition() {
  this.printSprites();
  this.receivedSprites.forEach(sprite => this.animate(new Move(sprite)));
}
