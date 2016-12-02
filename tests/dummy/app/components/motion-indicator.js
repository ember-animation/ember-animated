import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['motion-indicator'],
  classNameBindings: ['motionService.isAnimating:active'],
  motionService: Ember.inject.service('-ea-motion')
});
