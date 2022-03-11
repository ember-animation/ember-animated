import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import move from 'ember-animated/motions/move';

export default class extends Controller {
  @tracked showLeft = true;
  @tracked groupTogether = false;

  get showRight() {
    return !this.showLeft;
  }

  get howToGroup() {
    if (this.groupTogether) {
      return 'together';
    }
    return undefined;
  }

  *transition({ receivedSprites }) {
    receivedSprites.forEach(move);
  }

  @action toggle() {
    this.showLeft = !this.showLeft;
  }

  @action toggleGroupTogether() {
    this.groupTogether = !this.groupTogether;
  }
}
