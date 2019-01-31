'use strict';

const getChannelURL = require('ember-source-channel-url');
let angleBracketPolyfillVersion = "git+https://github.com/ef4/ember-angle-bracket-invocation-polyfill#e6f2feabbd313202a775fa9e5e0d6e47771592e5";

module.exports = function() {
  return Promise.all([
    getChannelURL('release'),
    getChannelURL('beta'),
    getChannelURL('canary')
  ]).then((urls) => {
    return {
      useYarn: true,

      scenarios: [
        {
          name: 'ember-lts-2.12',
          npm: {
            devDependencies: {
              'ember-source': '~2.12.0',
              'ember-native-dom-event-dispatcher': '~0.6.4',
              'ember-angle-bracket-invocation-polyfill': angleBracketPolyfillVersion,
              'ember-named-arguments-polyfill': '^1.0.0'

            }
          }
        },
        {
          name: 'ember-lts-2.16',
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({ 'jquery-integration': true })
          },
          npm: {
            devDependencies: {
              'ember-source': '~2.16.0',
              'ember-native-dom-event-dispatcher': '~0.6.4',
              'ember-angle-bracket-invocation-polyfill': angleBracketPolyfillVersion,
              'ember-named-arguments-polyfill': '^1.0.0'
            }
          }
        },

        {
          name: 'ember-lts-2.18',
          npm: {
            devDependencies: {
              'ember-source': '~2.18.0',
              'ember-native-dom-event-dispatcher': '~0.6.4',
              'ember-angle-bracket-invocation-polyfill': angleBracketPolyfillVersion,
              'ember-named-arguments-polyfill': '^1.0.0'
            }
          }
        },
        {
          name: 'ember-3.0',
          npm: {
            devDependencies: {
              'ember-source': '~3.0.0',
              'ember-angle-bracket-invocation-polyfill': angleBracketPolyfillVersion,
              'ember-named-arguments-polyfill': '^1.0.0'
            }
          }
        },
        {
          name: 'ember-3.4',
          npm: {
            devDependencies: {
              'ember-source': '~3.4.0'
            }
          }
        },
        {
          name: 'ember-release',
          npm: {
            devDependencies: {
              'ember-source': urls[0]
            }
          }
        },
        {
          name: 'ember-beta',
          npm: {
            devDependencies: {
              'ember-source': urls[1]
            }
          }
        },
        {
          name: 'ember-canary',
          npm: {
            devDependencies: {
              'ember-source': urls[2]
            }
          }
        },
        // The default `.travis.yml` runs this scenario via `npm test`,
        // not via `ember try`. It's still included here so that running
        // `ember try:each` manually or from a customized CI config will run it
        // along with all the other scenarios.
        {
          name: 'ember-default',
          npm: {
            devDependencies: {}
          }
        },
        {
          name: 'ember-default-with-jquery',
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({
              'jquery-integration': true
            })
          },
          npm: {
            devDependencies: {
              '@ember/jquery': '^0.5.1'
            }
          }
        }
      ]
    };
  });
};
