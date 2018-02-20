'use strict';

var VersionChecker = require('ember-cli-version-checker');
var path = require('path');
var mergeTrees = require('broccoli-merge-trees');
var Funnel = require('broccoli-funnel');

module.exports = {
  name: 'ember-animated',

  init() {
    if (this._super.init) {
      this._super.init.apply(this, arguments);
    }

    this.versionChecker = new VersionChecker(this);
    this.versionChecker.for('ember-cli', 'npm').assertAbove('0.2.0');

    // Shim this.import for Engines support
    if (!this.import) {
      // Shim from https://github.com/ember-cli/ember-cli/blob/5d64cfbf1276cf1e3eb88761df4546c891b5efa6/lib/models/addon.js#L387
      this._findHost = function findHostShim() {
        var current = this;
        var app;

        // Keep iterating upward until we don't have a grandparent.
        // Has to do this grandparent check because at some point we hit the project.
        do {
          app = current.app || app;
        } while (current.parent.parent && (current = current.parent));

        return app;
      };
      // Shim from https://github.com/ember-cli/ember-cli/blob/5d64cfbf1276cf1e3eb88761df4546c891b5efa6/lib/models/addon.js#L443
      this.import = function importShim(asset, options) {
        var app = this._findHost();
        app.import(asset, options);
      };
    }
  },

  treeForAddon: function(tree) {
    return this._super.treeForAddon.call(this, this._versionSpecificTree('addon', tree));
  },

  treeForAddonTemplates: function() {
    var tree = this._super.treeForAddonTemplates.apply(this, arguments);
    return this._versionSpecificTree('templates', tree);
  },

  _getEmberVersion: function() {
    var emberVersionChecker = this.versionChecker.for('ember', 'bower');

    if (emberVersionChecker.version) {
      return emberVersionChecker;
    }

    return this.versionChecker.for('ember-source', 'npm');
  },

  _versionSpecificTree: function(which, tree) {
    var emberVersion = this._getEmberVersion();

    if ((emberVersion.gt('2.9.0-beta') && emberVersion.lt('2.9.0'))|| emberVersion.gt('2.10.0-alpha')) {
      return this._withVersionSpecific(which, tree, '2.9');
    } else if (!emberVersion.lt('2.4.0')) {
      return this._withVersionSpecific(which, tree, '2.4');
    } else {
      throw new Error("This version of ember-animated supports Ember versions >= 2.4.0.");
    }
  },

  _withVersionSpecific: function(which, tree, version) {
    var versionSpecificPath = path.join(this.root, 'version-specific-' + version);
    var destDir;
    var include;
    if (which === 'templates') {
      destDir = 'version-specific';
      include = ["*.hbs"];
    } else {
      destDir = 'ember-internals/version-specific';
    }
    var funneled = new Funnel(versionSpecificPath, {
      include: include,
      destDir: destDir
    });
    return mergeTrees([tree, funneled]);
  },

  included: function() {
    this._super.apply(this, arguments);
    this.import('vendor/ember-animated.css');
  }
};
