//BEGIN-SNIPPET moving-word-text-snippet.js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import fade from 'ember-animated/transitions/fade';

export default class TransitionExample extends Component {
  transition = fade;

  @tracked listMode = false;

  @action toggle() {
    this.listMode = !this.listMode;
  }
}
//END-SNIPPET
