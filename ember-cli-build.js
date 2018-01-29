'use strict';

var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
  });
  app.import('node_modules/papaparse/papaparse.js', {using: [{ transformation: 'amd',  as: 'papaparse'}]});
  return app.toTree();
};
