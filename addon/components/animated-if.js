import Component from '@ember/component';
import layout from '../templates/components/animated-if';
import { computed } from '@ember/object';
/**
  A component that uses animate-each to define an animation and its parameters. The animation will
  be performed only in a specified case. Animate-if uses the same arguments as animate-each. 
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
