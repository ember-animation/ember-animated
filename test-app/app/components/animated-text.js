import Component from '@glimmer/component';
import move from 'ember-animated/motions/move';

export default class AnimatedText extends Component {
  *transition({ sentSprites }) {
    sentSprites.forEach(move);
  }
}
