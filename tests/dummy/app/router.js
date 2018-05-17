import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('demos', function() {
    this.route('each');
    this.route('container-only');
    this.route('two-lists');
    this.route('swapping-lists');
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
  });
  
  // ember-cli-addon-docs
  this.route('docs', function() {
    this.route('api', function() {
      this.route('item', { path: '/*path' });
    });

    this.route('between');
    this.route('sprites');
    this.route('motions');
    this.route('transitions');
    this.route('rules');
    

    this.route('animator-components', function() {
      
      this.route('value');
      this.route('if');
    });

    this.route('support-components', function() {
      this.route('container');
      this.route('orphans');
      this.route('beacon');
    });

    this.route('transition-context');
    this.route('sprite-api');
    this.route('built-in-transitions');
    this.route('built-in-motions');
    this.route('authoring-motions');
  });

  this.route('not-found', { path: '/*path' });
});

export default Router;
