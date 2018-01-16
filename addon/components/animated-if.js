import Component from '@ember/component';
import layout from '../templates/components/animated-if';

export default Component.extend({
  layout,
  tagName: ''
}).reopenClass({
  positionalParams: ['predicate']
});
