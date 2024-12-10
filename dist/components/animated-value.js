import { computed } from '@ember/object';
import Component, { setComponentTemplate } from '@ember/component';
import { A } from '@ember/array';
import { precompileTemplate } from '@ember/template-compilation';
import { n } from 'decorator-transforms/runtime';

var TEMPLATE = precompileTemplate("{{#animated-each this.items key=this.key rules=this.rules use=this.use duration=this.duration group=this.group watch=this.watch initialInsertion=this.initialInsertion finalRemoval=this.finalRemoval as |item|}}\n  {{yield item}}\n{{/animated-each}}\n");

/**
  A component that animates when a single value changes.
  Animated-value uses the same arguments as animated-each.

  ```hbs
  <AnimatedContainer>
    {{#animated-value this.counter rules=this.rules duration=100 as |v|}}
        <span class="numbers">{{v}}</span>
    {{/animated-value}}
  </AnimatedContainer>

  <button {{action "increment"}}>+</button>
  <button {{action "decrement"}}>-</button>
  ```

  ```js
  import Component from '@ember/component';
  import { toLeft, toRight } from 'ember-animated/transitions/move-over';

  export default Component.extend({
    rules({ oldItems, newItems }) {
      if (oldItems[0] < newItems[0]) {
        return toLeft;
      } else {
        return toRight;
      }
    },

    counter: 10,

    actions: {
      increment() {
        this.set('counter', this.get('counter') + 1);
      },
      decrement() {
        this.set('counter', this.get('counter') - 1);
      }
    }
  });
  ```
  @class animated-value
  @public
*/

class AnimatedValueComponent extends Component {
  /**
   * The data you are trying to render.
    @argument items
    @type unknown
  */
  value;
  tagName = '';
  finalRemoval;
  initialInsertion;
  watch;
  key;
  group;
  rules;
  use;
  duration;
  static positionalParams = ['value'];
  get items() {
    return A([this.value]);
  }
  static {
    n(this.prototype, "items", [computed('value')]);
  }
}
setComponentTemplate(TEMPLATE, AnimatedValueComponent);

export { AnimatedValueComponent as default };
//# sourceMappingURL=animated-value.js.map
