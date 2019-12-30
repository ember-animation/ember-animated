'use strict';

module.exports = {
  extends: 'octane',
  rules: {
    'attribute-indentation': false,
    'no-inline-styles': false,
    'img-alt-attributes': false,
    'no-invalid-interactive': false,
    'table-groups': false,
    quotes: false,
    'no-unused-block-params': false,
    'no-outlet-outside-routes': false,

    // disabling these until we can complete the octane-style upgrade
    'no-curly-component-invocation': false,
    'no-implicit-this': false,
    'require-valid-alt-text': false,
    'no-action': false,
  },

  // the docs app lints itself
  ignore: ['docs'],
};
