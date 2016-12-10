import Ember from 'ember';
import layout from '../templates/components/animated-bind';

export default Ember.Component.extend({
  tagName: '',
  layout,
  items: Ember.computed('value', function() {
    return [this.get('value')];
  })
}).reopenClass({
  positionalParams: ['value']
});
