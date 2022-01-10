import Component from '@glimmer/component';
import { tracked } from 'dummy/utils/tracking';
import { action } from '@ember/object';
import {
  toUp,
  toDown,
  toLeft,
  toRight,
} from 'ember-animated/transitions/move-over';

export default class BindExample extends Component {
  rules({ oldItems, newItems }) {
    if (oldItems[0] < newItems[0]) {
      return toDown;
    } else {
      return toUp;
    }
  }

  rules2({ oldItems, newItems }) {
    if (oldItems[0] < newItems[0]) {
      return toLeft;
    } else {
      return toRight;
    }
  }

  @tracked counter = 20;
  @tracked showBoth = true;

  @action increment() {
    this.counter++;
  }

  @action decrement() {
    this.counter--;
  }

  @action toggleShowBoth() {
    this.showBoth = !this.showBoth;
  }
}
