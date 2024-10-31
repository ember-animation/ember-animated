import { a as _defineProperty, _ as _applyDecoratedDescriptor } from '../_rollupPluginBabelHelpers-iYhWj1qN.js';
import { computed } from '@ember/object';
import Component, { setComponentTemplate } from '@ember/component';
import { A } from '@ember/array';
import { precompileTemplate } from '@ember/template-compilation';

var TEMPLATE = precompileTemplate("{{#animated-each this.items key=this.key rules=this.rules use=this.use duration=this.duration group=this.group watch=this.watch initialInsertion=this.initialInsertion finalRemoval=this.finalRemoval as |item|}}\n  {{yield item}}\n{{/animated-each}}\n");

var _dec, _class, _class2;
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
let AnimatedValueComponent = (_dec = computed('value'), (_class = (_class2 = class AnimatedValueComponent extends Component {
  constructor(...args) {
    super(...args);
    /**
     * The data you are trying to render.
      @argument items
      @type unknown
    */
    _defineProperty(this, "value", void 0);
    _defineProperty(this, "tagName", '');
    _defineProperty(this, "finalRemoval", void 0);
    _defineProperty(this, "initialInsertion", void 0);
    _defineProperty(this, "watch", void 0);
    _defineProperty(this, "key", void 0);
    _defineProperty(this, "group", void 0);
    _defineProperty(this, "rules", void 0);
    _defineProperty(this, "use", void 0);
    _defineProperty(this, "duration", void 0);
  }
  get items() {
    return A([this.value]);
  }
}, _defineProperty(_class2, "positionalParams", ['value']), _class2), (_applyDecoratedDescriptor(_class.prototype, "items", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "items"), _class.prototype)), _class));
setComponentTemplate(TEMPLATE, AnimatedValueComponent);

export { AnimatedValueComponent as default };
//# sourceMappingURL=animated-value.js.map
