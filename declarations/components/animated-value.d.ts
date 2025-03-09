import Component from '@ember/component';
import type { AnimatedEachSignature } from './animated-each.ts';
interface AnimatedValueSignature<T> {
    Args: {
        Positional: [T];
        Named: AnimatedEachSignature<[T]>['Args']['Named'];
    };
    Blocks: {
        default: [T];
    };
}
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
export default class AnimatedValueComponent<T> extends Component<AnimatedValueSignature<T>> {
    /**
     * The data you are trying to render.
      @argument items
      @type unknown
    */
    value: T;
    tagName: string;
    finalRemoval: AnimatedEachSignature<T>['Args']['Named']['finalRemoval'];
    initialInsertion: AnimatedEachSignature<T>['Args']['Named']['initialInsertion'];
    watch: AnimatedEachSignature<T>['Args']['Named']['watch'];
    key: AnimatedEachSignature<T>['Args']['Named']['key'];
    group: AnimatedEachSignature<T>['Args']['Named']['group'];
    rules: AnimatedEachSignature<T>['Args']['Named']['rules'];
    use: AnimatedEachSignature<T>['Args']['Named']['use'];
    duration: AnimatedEachSignature<T>['Args']['Named']['duration'];
    static positionalParams: string[];
    get items(): T[];
}
export {};
//# sourceMappingURL=animated-value.d.ts.map