'use strict';

module.exports = {
  extends: 'recommended',
  rules: {
    'no-inline-styles': false,
    'no-curly-component-invocation': {
      allow: [
        'animated-value',
        'animated-each',
        'animated-if',
        'animated-beacon',
      ],
    },
  },

  // the docs app lints itself
  ignore: ['docs/**'],
};
