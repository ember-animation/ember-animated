//BEGIN-SNIPPET transitions-fade-snippet.js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import fade from 'ember-animated/transitions/fade';

export default class TransitionFadeExample extends Component {
  transition = fade;

  @tracked fadeMessage = false;

  @action toggleFadeMessage() {
    this.fadeMessage = !this.fadeMessage;
  }
}
//END-SNIPPET
