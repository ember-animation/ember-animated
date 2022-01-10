import Component from '@glimmer/component';
import { tracked } from 'dummy/utils/tracking';
import { action } from '@ember/object';
import { toLeft, toRight } from 'ember-animated/transitions/move-over';

export default class ValueDemo extends Component {
  rules({ oldItems, newItems }) {
    if (oldItems[0] < newItems[0]) {
      return toLeft;
    } else {
      return toRight;
    }
  }

  @tracked counter = 10;

  @action increment() {
    this.counter++;
  }

  @action decrement() {
    this.counter--;
  }
}
