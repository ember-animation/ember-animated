/*jshint node:true*/
/* global require, module */
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    nodeModulesToVendor: [
      'node_modules/velocity-animate'
    ]
  });

  app.import('vendor/velocity.js', {
    using: [{ transformation: 'amd', as: 'velocity' }]
  });

  return app.toTree();
};
