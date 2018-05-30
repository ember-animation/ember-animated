'use strict';

var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    vendorFiles: { 'jquery.js': null, 'app-shims.js': null },
    babel: {
      plugins: [
        'transform-class-properties'
      ]
    }
  });
  return app.toTree();
};
