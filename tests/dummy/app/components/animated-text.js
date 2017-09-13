import Ember from 'ember';

export default Ember.Component.extend({
  tagName: ''
}).reopenClass({
  positionalParams: ['text']
});
