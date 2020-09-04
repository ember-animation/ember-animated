import Component from '@ember/component';
import { forEachElement } from 'ember-animated/-private/ember-internals';
import { AnimatorComponent } from './animator';

export default class Sprites extends Component {
  static positionalParams = ['type'];
  tagName = '';
  animatorComponent!: AnimatorComponent;
  type = 'default';

  didRender() {
    forEachElement(this, element => {
      this.animatorComponent.registerSprite(element, this.type);
    });
  }
}
