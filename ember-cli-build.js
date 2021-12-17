'use strict';

let EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function (defaults) {
  let app = new EmberAddon(defaults, {
    vendorFiles: { 'jquery.js': null, 'app-shims.js': null },
  });
  return app.toTree();
};
