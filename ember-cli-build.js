/* eslint-env node */

var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
var modernFeatures = require('./index').modernFeatures;

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    babel: {
      blacklist: modernFeatures()
    }
  });
  return app.toTree();
};
