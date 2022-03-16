const { addonV1Shim } = require('@embroider/addon-shim');
module.exports = {
  ...addonV1Shim(__dirname),
  init(...args) {
    this._super.init.apply(this, args);

    this.treePaths.addon = 'src';
  },
};
