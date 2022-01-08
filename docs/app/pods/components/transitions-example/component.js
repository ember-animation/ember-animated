/* eslint-disable require-yield */
//BEGIN-SNIPPET transitions-snippet.js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import move from 'ember-animated/motions/move';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';

export default class TransitionCustomExample extends Component {
  @tracked showMessage = false;

  @action toggleShowMessage() {
    this.showMessage = !this.showMessage;
  }

  /* custom transition */
  *slideFromSide({ insertedSprites, keptSprites, removedSprites }) {
    insertedSprites.forEach((sprite) => {
      sprite.startAtPixel({ x: window.innerWidth });
      sprite.applyStyles({ 'z-index': '1' });
      move(sprite, { easing: easeOut });
    });

    keptSprites.forEach((sprite) => {
      sprite.applyStyles({ 'z-index': '1' });
      move(sprite);
    });

    removedSprites.forEach((sprite) => {
      sprite.applyStyles({ 'z-index': '1' });
      sprite.endAtPixel({ x: window.innerWidth });
      move(sprite, { easing: easeIn });
    });
  }
}
//END-SNIPPET
