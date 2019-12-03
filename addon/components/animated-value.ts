import { computed } from '@ember/object';
import Component from '@ember/component';
import { A } from '@ember/array';
import { gte } from 'ember-compatibility-helpers';

// @ts-ignore: templates don't have types
import layout from '../templates/components/animated-value';

/**
  A component that animates when a single value changes.
  Animated-value uses the same arguments as animated-each.
  ```hbs
    <AnimatedContainer>
      {{#animated-value counter rules=rules duration=100 as |v|}}
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
  value!: unknown;

  tagName = '';
  layout = layout;

  @computed('value')
  get items() {
    return A([this.value]);
  }

  constructor(properties: any | undefined) {
    super(
      gte('3.8.0')
        ? properties
        : // in older Ember, for the Component base class to see these class
          // properties they must get passed into super:
          Object.assign(properties, { layout, tagName: '' }),
    );
    if (!gte('3.8.0')) {
      // in older Ember, any declared but not initialized class properties that
      // come in as arguments need to get re-set here because typescript
      // initializes them to undefined *after* Ember has already set them in
      // super.
      this.value = properties.value;
    }
  }
}

AnimatedValueComponent.reopenClass({
  positionalParams: ['value'],
});

export default AnimatedValueComponent;
