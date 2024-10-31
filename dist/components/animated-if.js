import { a as _defineProperty, _ as _applyDecoratedDescriptor } from '../_rollupPluginBabelHelpers-iYhWj1qN.js';
import Component, { setComponentTemplate } from '@ember/component';
import { computed } from '@ember/object';
import { precompileTemplate } from '@ember/template-compilation';

var TEMPLATE = precompileTemplate("{{#animated-value this.predicate key=this.key rules=this.rules use=this.use duration=this.duration group=this.realGroup initialInsertion=this.initialInsertion finalRemoval=this.finalRemoval as |currentPredicate|}}\n  {{#if currentPredicate}}\n    {{yield}}\n  {{else}}\n    {{yield to=\"inverse\"}}\n  {{/if}}\n{{/animated-value}}\n");

var _dec, _class, _class2;
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
let AnimatedIfComponent = (_dec = computed('group'), (_class = (_class2 = class AnimatedIfComponent extends Component {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "tagName", '');
    _defineProperty(this, "group", void 0);
    _defineProperty(this, "finalRemoval", void 0);
    _defineProperty(this, "initialInsertion", void 0);
    _defineProperty(this, "key", void 0);
    _defineProperty(this, "rules", void 0);
    _defineProperty(this, "use", void 0);
    _defineProperty(this, "duration", void 0);
  }
  get realGroup() {
    return this.group || `animated_if_${Math.floor(Math.random() * 1000000)}`;
  }
}, _defineProperty(_class2, "positionalParams", ['predicate']), _class2), (_applyDecoratedDescriptor(_class.prototype, "realGroup", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "realGroup"), _class.prototype)), _class));
setComponentTemplate(TEMPLATE, AnimatedIfComponent);

export { AnimatedIfComponent as default };
//# sourceMappingURL=animated-if.js.map
