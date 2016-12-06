/*jshint node:true*/
module.exports = {
  scenarios: [
    {
      name: 'ember-1.13',
      bower: {
        dependencies: {
          'ember': '~1.13.0'
        },
        resolutions: {
          'ember': '~1.13.0'
        }
      },
      npm: {
        devDependencies: {
          "ember-getowner-polyfill": "https://github.com/ef4/ember-getowner-polyfill.git#true-polyfill",
          "ember-hash-helper-polyfill": "0.1.1"
        }
      }
    },
    {
      name: 'ember-2.0.3',
      bower: {
        dependencies: {
          'ember': 'components/ember#2.0.3'
        },
        resolutions: {
          'ember': 'lts-2-4'
        }
      },
      npm: {
        devDependencies: {
          "ember-getowner-polyfill": "https://github.com/ef4/ember-getowner-polyfill.git#true-polyfill",
          "ember-hash-helper-polyfill": "0.1.1"
        }
      }
    },
    {
      name: 'ember-lts-2.4',
      bower: {
        dependencies: {
          'ember': 'components/ember#lts-2-4'
        },
        resolutions: {
          'ember': 'lts-2-4'
        }
      }
    },
    {
      name: 'ember-release',
      bower: {
        dependencies: {
          'ember': 'components/ember#release'
        },
        resolutions: {
          'ember': 'release'
        }
      }
    },
    {
      name: 'ember-beta',
      bower: {
        dependencies: {
          'ember': 'components/ember#beta'
        },
        resolutions: {
          'ember': 'beta'
        }
      }
    },
    {
      name: 'ember-canary',
      bower: {
        dependencies: {
          'ember': 'components/ember#canary'
        },
        resolutions: {
          'ember': 'canary'
        }
      }
    }
  ]
};
