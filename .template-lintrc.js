'use strict';

module.exports = {
  extends: 'octane',
  rules: {
    'attribute-indentation': false,
    'no-inline-styles': false,
    'require-valid-alt-text': false,
    'no-invalid-interactive': false,
    'table-groups': false,
    quotes: false,
    'no-unused-block-params': false,
    'no-outlet-outside-routes': false,

    // disabled until we can finish updating
    'no-implicit-this': false,
    'require-button-type': false,
    'no-curly-component-invocation': false,
    'no-action': false,
  },
};
