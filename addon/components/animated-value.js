import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from '../templates/components/animated-value';

/**
  A component that uses animate-each to perform an animation on a single value. This allows for different types of parameters to be set for separate values. 
  Animate-value uses the same arguments as animate-each. 
  ```hbs
  {{export default Component.extend({
    tagName: '',
    layout,
    items: computed('value', function() {
    return [this.get('value')];
  })
}).reopenClass({
  positionalParams: ['value']
}); }}
  ```
  @class AnimatedValue
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
