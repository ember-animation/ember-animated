'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    autoImport: {
      watchDependencies: ['ember-animated'],
    },
    'ember-cli-addon-docs': {
      documentingAddonAt: '../addon',
    },
  });

  return app.toTree();
};
