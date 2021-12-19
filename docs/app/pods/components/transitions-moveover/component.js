//BEGIN-SNIPPET transitions-moveover-snippet.js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { toLeft, toRight } from 'ember-animated/transitions/move-over';

export default class TransitionMoveOverExample extends Component {
  @tracked showHello = false;

  @action toggleShowHello() {
    this.showHello = !this.showHello;
  }

  rules({ newItems }) {
    if (newItems[0]) {
      return toRight;
    } else {
      return toLeft;
    }
  }
}
//END-SNIPPET
