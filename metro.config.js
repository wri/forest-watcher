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
      // react-native-mbtiles is a local `file:` dependency that ships with its
      // own node_modules containing an old react-native (which requires the
      // long-removed `create-react-class`). Block both locations:
      //   1. The workspace source dir (react-native-mbtiles/node_modules/...)
      //   2. The yarn-installed copy    (node_modules/react-native-mbtiles/node_modules/...)
      new RegExp(
        path.resolve(__dirname, 'react-native-mbtiles', 'node_modules').replace(/\//g, '[\\/]') + '[\\/].*'
      ),
      new RegExp(
        path.resolve(__dirname, 'node_modules', 'react-native-mbtiles', 'node_modules').replace(/\//g, '[\\/]') + '[\\/].*'
      )
    ],
    // react-native/Libraries/Network/XHRInterceptor was removed as a private
    // internal module in RN 0.73+. Reactotron's networking plugin still imports
    // it directly; redirect to a no-op shim so the bundle resolves cleanly.
    extraNodeModules: {
      'react-native/Libraries/Network/XHRInterceptor': path.resolve(__dirname, 'app/shims/XHRInterceptor.js'),
    },
  }
};

module.exports = withSentryConfig(mergeConfig(getDefaultConfig(__dirname), config));