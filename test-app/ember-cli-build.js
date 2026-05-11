'use strict';

const { readFileSync, writeFileSync } = require('node:fs');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

let ember = require('./package.json').devDependencies['ember-source'];

if (ember.startsWith('6.12') || ember.startsWith('7.')) {
  let optionalFeatures = JSON.parse(
    readFileSync('./config/optional-features.json'),
  );
  writeFileSync(
    './config/optional-features.json',
    JSON.stringify({
      ...optionalFeatures,
      'use-ember-modules': true,
    }),
  );
}

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    autoImport: {
      forbidEval: true,
      watchDependencies: ['ember-animated'],
      webpack: {
        module: {
          rules: [
            {
              test: (filename) => filename.endsWith('.js'),
              use: {
                loader: 'babel-loader-8',
                options: {
                  plugins: [
                    [
                      require.resolve('babel-plugin-undeprecate-inject-from-at-ember-service'),
                      {},
                    ],
                  ],
                },
              },
            },
          ],
        },
      },
    },
    babel: {
      plugins: [
        [
          require.resolve('babel-plugin-undeprecate-inject-from-at-ember-service'),
          {},
        ],
      ],
    },
    'ember-cli-babel': { enableTypeScriptTransform: true },
    emberData: {
      deprecations: {
        DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: false,
      },
    },

    // Add options here
  });

  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app);
};
