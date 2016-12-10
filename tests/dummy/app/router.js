import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('each');
  this.route('container-only');
  this.route('two-lists');
  this.route('swapping-lists');
  this.route('bind');
});

export default Router;
