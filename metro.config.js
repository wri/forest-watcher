const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const {
 withSentryConfig
} = require("@sentry/react-native/metro");

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    blockList: [
      // Prevent Metro from bundling the old React Native version inside react-native-mbtiles' own node_modules
      new RegExp(path.resolve(__dirname, 'react-native-mbtiles', 'node_modules').replace(/\//g, '[\\/]') + '[\\/].*')
    ]
  }
};

module.exports = withSentryConfig(mergeConfig(getDefaultConfig(__dirname), config));