'use strict';

module.exports = {
  extends: 'octane',
  rules: {
    'attribute-indentation': false,
    'no-inline-styles': false,
    'require-valid-alt-text': false,
    'no-invalid-interactive': false,
    'table-groups': false,
    'require-button-type': false,
    quotes: false,
    'no-unused-block-params': false,
    'no-outlet-outside-routes': false,
    'no-curly-component-invocation': {
      allow: [
        'animated-value',
        'animated-each',
        'animated-if',
        'animated-beacon',
      ],
    },

    // disabling these until we can complete the octane-style upgrade
    'no-action': false,
  },

  // the docs app lints itself
  ignore: ['docs/**'],
};
