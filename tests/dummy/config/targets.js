/* eslint-env node */

let browsers;

if (process.env.EMBER_ENV === 'development') {
  browsers = [
    'last 1 Chrome versions'
  ];
} else {
  browsers = [
    'ie 9',
    'last 1 Chrome versions',
    'last 1 Firefox versions',
    'last 1 Safari versions'
  ]
}

module.exports = { browsers };
