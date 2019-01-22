'use strict';

var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
var docsEnabled = process.env.RAISE_ON_DEPRECATION !== 'true';

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    addons: {
      blacklist: docsEnabled ? [] : ['ember-cli-addon-docs']
    },
    vendorFiles: { 'jquery.js': null, 'app-shims.js': null },
    babel: {
      plugins: [
        'transform-class-properties',
        'macros'
      ]
    },
    'ember-cli-uglify': {
			uglify: {
				compress: {
          // https://github.com/ember-cli/ember-cli/issues/8075
					collapse_vars: false
				}
			}
		},
  });
  return app.toTree();
};
