import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('demos', function() {
    this.route('each');
    this.route('container-only');
    this.route('two-lists');
    this.route('swapping-lists');
    this.route('bind');
    this.route('hero', function() {
      this.route('detail', { path: '/:id' });
    });
    this.route('nested');
    this.route('direct-style');
    this.route('inline-text');
    this.route('orphan');
    this.route('here-there');
    this.route('svg');
    this.route('beacon');
    this.route('ifdemo');
    this.route('eachdemo');
    this.route('valuedemo');
    this.route('containerdemo');
    this.route('beacondemo');
    this.route('modal');
    this.route('sandbox');
    this.route('color-and-shadow');
  });
});
