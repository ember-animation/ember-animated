import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import preval from 'babel-plugin-preval/macro';
import buildIf from 'build-if.macro';

const useDocs = preval`module.exports = process.env.RAISE_ON_DEPRECATION !== 'true'`;
const BaseRouter = buildIf(useDocs, () => AddonDocsRouter, () => EmberRouter);

const Router = BaseRouter.extend({
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
    this.route('ifdemo');
    this.route('eachdemo');
    this.route('valuedemo');
    this.route('containerdemo');
    this.route('beacondemo');
    this.route('modal');
  });

  buildIf(useDocs, () => {
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

});

export default Router;
