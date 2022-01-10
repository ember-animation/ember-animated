import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked, dependentKeyCompat } from 'dummy/utils/tracking';
import move from 'ember-animated/motions/move';

export default class extends Controller {
  @tracked showLeft = true;
  @tracked groupTogether = false;

  @dependentKeyCompat
  get showRight() {
    return !this.showLeft;
  }

  @dependentKeyCompat
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
