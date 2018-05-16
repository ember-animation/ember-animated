import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from '../templates/components/animated-value';

/**
  A component that uses animate-each to perform an animation on a single predicate value. This component performs the
  animation each time the predicate value is updated (sent or received).  Animated-value uses the same parameters as animate-each. 
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
