'use strict';

module.exports = {
  name: require('./package').name,

  isDevelopingAddon() {
    return process.env.DEV_EMBER_ANIMATED;
  },
};
