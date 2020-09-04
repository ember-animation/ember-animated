import Component from '@glimmer/component';
import { AnimatorComponent } from './animator';

interface AnimatedMatchArgs {}

export default class AnimatedMatch extends Component<AnimatedMatchArgs>
  implements AnimatorComponent {
  private sprites = new Map();

  registerSprite(element: Element, type: string) {
    if (this.sprites.has(element)) {
      console.log(`sprite updated`, element, type);
    } else {
      console.log(`sprite registered`, element, type);
    }
    this.sprites.set(element, type);
  }
}
