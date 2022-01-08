//BEGIN-SNIPPET rules-snippet.js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { toUp, toDown } from 'ember-animated/transitions/move-over';

export default class RulesExample extends Component {
  rules({ oldItems, newItems }) {
    if (oldItems[0] < newItems[0]) {
      return toDown;
    } else {
      return toUp;
    }
  }

  @tracked counter = 20;

  @action increment() {
    this.counter++;
  }

  @action decrement() {
    this.counter--;
  }
}
//END-SNIPPET
