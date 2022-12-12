'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

module.exports = async function () {
  return {
    usePnpm: true,
    scenarios: [
      {
        name: 'ember-lts-3.16',
        npm: {
          devDependencies: {
            'ember-source': '~3.16.0',
          },
          dependenciesMeta: {
            'ember-animated': {
              injected: true,
            },
          },
        },
      },
      {
        name: 'ember-lts-3.20',
        npm: {
          devDependencies: {
            'ember-source': '~3.20.5',
          },
          dependenciesMeta: {
            'ember-animated': {
              injected: true,
            },
          },
        },
      },
      {
        name: 'ember-lts-3.24',
        npm: {
          devDependencies: {
            'ember-source': '~3.24.3',
          },
          dependenciesMeta: {
            'ember-animated': {
              injected: true,
            },
          },
        },
      },
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: {
            'ember-source': '~3.28.8',
          },
          dependenciesMeta: {
            'ember-animated': {
              injected: true,
            },
          },
        },
      },
      {
        name: 'ember-lts-4.4',
        npm: {
          devDependencies: {
            'ember-source': '~4.4.0',
          },
          dependenciesMeta: {
            'ember-animated': {
              injected: true,
            },
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
          },
          dependenciesMeta: {
            'ember-animated': {
              injected: true,
            },
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
          },
          dependenciesMeta: {
            'ember-animated': {
              injected: true,
            },
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
          },
          dependenciesMeta: {
            'ember-animated': {
              injected: true,
            },
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
            'ember-source': '~3.28.8',
          },
          ember: {
            edition: 'classic',
          },
          dependenciesMeta: {
            'ember-animated': {
              injected: true,
            },
          },
        },
      },
      embroiderSafe({
        npm: {
          dependenciesMeta: {
            'ember-animated': {
              injected: true,
            },
          },
        },
      }),
      embroiderOptimized({
        npm: {
          dependenciesMeta: {
            'ember-animated': {
              injected: true,
            },
          },
        },
      }),
    ],
  };
};
