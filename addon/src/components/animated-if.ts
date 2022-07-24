import Component from '@ember/component';
import { computed } from '@ember/object';

/**
  A drop in replacement for `{{#if}}` that animates changes when the predicate changes.
  Animated-if uses the same arguments as animated-each.
  ```hbs
  <button {{on 'click' this.toggleThing}}>Toggle</button>

  {{#animated-if showThing use=transition}}
    <div class="message" {{on 'click' "toggleThing"}} role="button">
      myContent
    </div>
  {{/animated-if}}
  ```
  ```js
  import Component from '@glimmer/component';
  import move from 'ember-animated/motions/move';
  import { easeOut, easeIn } from 'ember-animated/easings/cosine';
  import { tracked } from '@glimmer/tracking';

  export default class FooComponent extends Component {
    @tracked showThing = false;

    toggleThing() {
      this.showThing = !this.showThing;
    }

    // eslint-disable-next-line require-yield
    *transition({ insertedSprites, keptSprites, removedSprites }) {
      for (let sprite of insertedSprites) {
        sprite.startAtPixel({ x: window.innerWidth });
        move(sprite, { easing: easeOut });
      }

      for (let sprite of keptSprites) {
        move(sprite);
      }

      for (let sprite of removedSprites) {
        sprite.endAtPixel({ x: window.innerWidth });
        move(sprite, { easing: easeIn });
      }
    }
  });
  ```
  @class animated-if
  @public
*/
export default class AnimatedIfComponent extends Component {
  tagName = '';
  static positionalParams = ['predicate'];

  group: string | undefined;

  @computed('group')
  get realGroup() {
    return this.group || `animated_if_${Math.floor(Math.random() * 1000000)}`;
  }
}
