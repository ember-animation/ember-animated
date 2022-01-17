'use strict';

const getChannelURL = require('ember-source-channel-url');
// const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

module.exports = async function () {
  return {
    useYarn: true,
    scenarios: [
      {
        name: 'ember-lts-3.4',
        npm: {
          devDependencies: {
            'ember-decorators-polyfill': '^1.1.5',
            'ember-fn-helper-polyfill': '^1.0.2',
            'ember-on-modifier': '^1.0.1',
            'ember-source': '~3.4.0',
            'ember-tracked-polyfill': '^0.1.0',
          },
        },
      },
      {
        name: 'ember-lts-3.8',
        npm: {
          devDependencies: {
            'ember-decorators-polyfill': '^1.1.5',
            'ember-fn-helper-polyfill': '^1.0.2',
            'ember-on-modifier': '^1.0.1',
            'ember-source': '~3.8.0',
            'ember-tracked-polyfill': '^0.1.0',
          },
        },
      },
      {
        name: 'ember-lts-3.12',
        npm: {
          devDependencies: {
            'ember-decorators-polyfill': '^1.1.5',
            'ember-source': '~3.12.4',
            'ember-tracked-polyfill': '^0.1.0',
          },
        },
      },
      {
        name: 'ember-lts-3.16',
        npm: {
          devDependencies: {
            'ember-source': '~3.16.0',
          },
        },
      },
      {
        name: 'ember-lts-3.20',
        npm: {
          devDependencies: {
            'ember-source': '~3.20.5',
          },
        },
      },
      {
        name: 'ember-lts-3.24',
        npm: {
          devDependencies: {
            'ember-source': '~3.24.3',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
          },
        },
      },
      {
        name: 'ember-default-with-jquery',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'jquery-integration': true,
          }),
        },
        npm: {
          devDependencies: {
            '@ember/jquery': '^1.1.0',
          },
        },
      },
      {
        name: 'ember-classic',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'application-template-wrapper': true,
            'default-async-observers': false,
            'template-only-glimmer-components': false,
          }),
        },
        npm: {
          devDependencies: {
            'ember-source': '~3.24.3',
          },
          ember: {
            edition: 'classic',
          },
        },
      },
      // embroiderSafe(),
      // embroiderOptimized(),
    ],
  };
};
