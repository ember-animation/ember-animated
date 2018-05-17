import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from '../templates/components/animated-value';

/**
  A component that animates when a single value changes. 
  Animated-value uses the same arguments as animate-each.
  ```hbs
  {{#animated-value value use=myFancyTransition duration=2000 as |v|}}
        <span>{{v}}</span>
      {{/animated-value}}
  ```
  @class animated-value
  @public
*/



export default Component.extend({
  tagName: '',
  layout,
  items: computed('value', function() {
    return [this.get('value')];
  })
}).reopenClass({
  positionalParams: ['value']
});
