'use strict';

module.exports = {
  name: require('./package').name,

  isDevelopingAddon() {
    return process.env.DEV_EMBER_ANIMATED;
  },

  init() {
    if (this._super.init) {
      this._super.init.apply(this, arguments);
    }

    // Shim this.import for Engines support
    if (!this.import) {
      // Shim from https://github.com/ember-cli/ember-cli/blob/5d64cfbf1276cf1e3eb88761df4546c891b5efa6/lib/models/addon.js#L387
      this._findHost = function findHostShim() {
        let current = this;
        let app;

        // Keep iterating upward until we don't have a grandparent.
        // Has to do this grandparent check because at some point we hit the project.
        do {
          app = current.app || app;
        } while (current.parent.parent && (current = current.parent));

        return app;
      };
      // Shim from https://github.com/ember-cli/ember-cli/blob/5d64cfbf1276cf1e3eb88761df4546c891b5efa6/lib/models/addon.js#L443
      this.import = function importShim(asset, options) {
        let app = this._findHost();
        app.import(asset, options);
      };
    }
  },

  included: function() {
    this._super.apply(this, arguments);
    this.import('vendor/ember-animated.css');
  },
};
