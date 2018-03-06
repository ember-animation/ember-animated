'use strict';

const CssImport = require('postcss-import');
const CssNext = require('postcss-cssnext');

var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    postcssOptions: {
      compile: {
        enabled: true,
        plugins: [
          { module: CssImport },
          { module: CssNext }
        ]
      }
    }
  });
  return app.toTree();
};
