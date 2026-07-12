import { Platform, UIManager } from 'react-native';
import { Navigation } from 'react-native-navigation';
import App from './app/main.tsx';
import { disableAnalytics } from 'helpers/analytics';

global.Buffer = global.Buffer || require('buffer').Buffer;

// Don't enable animation support on Android, as it was causing strange UI issues (see https://3sidedcube.atlassian.net/browse/GFW-370)
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(false);
}

disableAnalytics(__DEV__);

const app = new App();
let hasSetupStarted = false;

const startAppSetup = () => {
  if (hasSetupStarted) {
    return;
  }
  hasSetupStarted = true;
  app.setupApp();
};

// Kick startup immediately once JS bundle is evaluated.
startAppSetup();

// We'll setup the app whenever RNN tells us the app has safely launched
// See https://wix.github.io/react-native-navigation/#/docs/app-launch
Navigation.events().registerAppLaunchedListener(() => {
  startAppSetup();
});

// Fallback for old-architecture startup where app launched events may be swallowed.
setTimeout(startAppSetup, 1200);

export default app;
