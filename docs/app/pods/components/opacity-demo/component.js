/* eslint-disable require-yield */
//BEGIN-SNIPPET opacity-demo-snippet.js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';

export default class OpacityDemo extends Component {
  @tracked fadeMessage = false;

  @action toggleFadeMessage() {
    this.fadeMessage = !this.fadeMessage;
  }

  *transition({ insertedSprites, removedSprites }) {
    insertedSprites.forEach(fadeIn);
    removedSprites.forEach(fadeOut);
  }
}
//END-SNIPPET
