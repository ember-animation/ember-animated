import Component from '@ember/component';
import layout from '../templates/components/animated-if';
import { computed } from '@ember/object';
/**
  A component that uses animate-each to define an animation and its parameters. Animate-if conditionally renders 
  one of two branches depending on the value of the predicate. The animation occurs any time the predicate value changes.  
  Animate-if uses the same parameters as animate-each
  ```hbs
  {{export default Component.extend({
    layout,
    tagName: '',
    realGroup: computed('group', function() {
       return this.get('group') || `animated_if_${Math.floor(Math.random()*1000000)}`;
  }),
}).reopenClass({
  positionalParams: ['predicate']
});}}
  ```
  @class AnimatedIf
  @public
*/
export default Component.extend({
  layout,
  tagName: '',
  realGroup: computed('group', function() {
    return this.get('group') || `animated_if_${Math.floor(Math.random()*1000000)}`;
  }),
}).reopenClass({
  positionalParams: ['predicate']
});
