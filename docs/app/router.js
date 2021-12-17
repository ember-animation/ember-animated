import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from './config/environment';

export default class Router extends AddonDocsRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  docsRoute(this, function () {
    this.route('between', function () {
      this.route('detail', { path: '/:id' });
    });
    this.route('sprites');
    this.route('transitions');
    this.route('motions');
    this.route('rules');
    this.route('beacons');
  });
  this.route('not-found', { path: '/*path' });
});
