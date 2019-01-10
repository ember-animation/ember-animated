import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from './config/environment';

const Router = AddonDocsRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('demos', function() {
    this.route('each');
    this.route('container-only');
    this.route('two-lists');
    this.route('swapping-lists');
    this.route('swap-nested');
    this.route('bind');
    this.route('hero', function(){
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
  });

  // ember-cli-addon-docs
  docsRoute(this, function() {
    this.route('between', function(){
      this.route('detail', { path: '/:id' });
    });
    this.route('sprites');
    this.route('transitions');
    this.route('motions');
    this.route('rules');
    this.route('beacons');


    this.route('animator-components', function() {

      this.route('value');
      this.route('if');
    });
  });

  this.route('not-found', { path: '/*path' });
});

export default Router;
