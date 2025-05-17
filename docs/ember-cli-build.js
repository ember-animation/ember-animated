'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = async function (defaults) {
  const { setConfig } = await import('@warp-drive/build-config');

  const app = new EmberApp(defaults, {
    autoImport: {
      forbidEval: true,
      watchDependencies: ['ember-animated'],
    },
    'ember-cli-addon-docs': {
      documentingAddonAt: '../addon',
    },
    // emberData: {
    //   deprecations: {
    //     DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: false,
    //   },
    // },
  });

  setConfig(app, __dirname, {
    // WarpDrive/EmberData settings go here (if any)
    deprecations: {
      DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: false,
    },
  });

  return app.toTree();
};
