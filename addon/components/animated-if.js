import Ember from 'ember';
import layout from '../templates/components/animated-if';

export default Ember.Component.extend({
  layout,
  tagName: ''
}).reopenClass({
  positionalParams: ['predicate']
});
