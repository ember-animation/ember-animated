import Component from '@ember/component';
import type { AnimatedEachSignature } from './animated-each.ts';
interface AnimatedIfSignature<T> {
    Args: {
        Positional: [T];
        Named: AnimatedEachSignature<[T]>['Args']['Named'];
    };
    Blocks: {
        default: [];
        else: [];
    };
}
/**
  A drop in replacement for `{{#if}}` that animates changes when the predicate changes.
  Animated-if uses the same arguments as animated-each.

  ```hbs
  <button {{on 'click' this.toggleThing}}>Toggle</button>

  {{#animated-if showThing use=transition}}
    <div class="message" {{on 'click' this.toggleThing}} role="button">
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
  };
  ```
  @class animated-if
  @public
*/
export default class AnimatedIfComponent<T> extends Component<AnimatedIfSignature<T>> {
    tagName: string;
    static positionalParams: string[];
    predicate: T;
    group: AnimatedEachSignature<T>['Args']['Named']['group'];
    finalRemoval: AnimatedEachSignature<T>['Args']['Named']['finalRemoval'];
    initialInsertion: AnimatedEachSignature<T>['Args']['Named']['initialInsertion'];
    key: AnimatedEachSignature<T>['Args']['Named']['key'];
    rules: AnimatedEachSignature<T>['Args']['Named']['rules'];
    use: AnimatedEachSignature<T>['Args']['Named']['use'];
    duration: AnimatedEachSignature<T>['Args']['Named']['duration'];
    get realGroup(): string;
}
export {};
//# sourceMappingURL=animated-if.d.ts.map