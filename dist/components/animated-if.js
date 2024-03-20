import Component, { setComponentTemplate } from '@ember/component';
import { computed } from '@ember/object';
import { precompileTemplate } from '@ember/template-compilation';
import { n } from 'decorator-transforms/runtime';

var TEMPLATE = precompileTemplate("{{#animated-value this.predicate key=this.key rules=this.rules use=this.use duration=this.duration group=this.realGroup initialInsertion=this.initialInsertion finalRemoval=this.finalRemoval as |currentPredicate|}}\n  {{#if currentPredicate}}\n    {{yield}}\n  {{else}}\n    {{yield to=\"inverse\"}}\n  {{/if}}\n{{/animated-value}}\n");

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
class AnimatedIfComponent extends Component {
  tagName = '';
  static positionalParams = ['predicate'];
  group;
  finalRemoval;
  initialInsertion;
  key;
  rules;
  use;
  duration;
  get realGroup() {
    return this.group || `animated_if_${Math.floor(Math.random() * 1000000)}`;
  }
  static {
    n(this.prototype, "realGroup", [computed('group')]);
  }
}
setComponentTemplate(TEMPLATE, AnimatedIfComponent);

export { AnimatedIfComponent as default };
//# sourceMappingURL=animated-if.js.map
