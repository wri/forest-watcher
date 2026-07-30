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
let hasSetupCompleted = false;
let setupInFlight = false;
let hasNavigationLaunchSignal = false;

const startAppSetup = async () => {
  if (hasSetupCompleted || setupInFlight) {
    return;
  }

  setupInFlight = true;
  try {
    await app.setupApp();
    hasSetupCompleted = true;
  } catch (err) {
    // Keep retries enabled for app-launched/time-based fallbacks.
    console.warn('WRI', 'setupApp failed, will retry', err);
  } finally {
    setupInFlight = false;
  }
};

const onNavigationReady = () => {
  if (hasNavigationLaunchSignal) {
    return;
  }

  hasNavigationLaunchSignal = true;
  if (typeof app.onNavigationReady === 'function') {
    app.onNavigationReady();
  }
  startAppSetup();
};

// We'll setup the app whenever RNN tells us the app has safely launched
// See https://wix.github.io/react-native-navigation/#/docs/app-launch
try {
  Navigation.events().registerAppLaunchedListener(() => {
    onNavigationReady();
  });
} catch (err) {
  // Keep startup alive even if events emitter wiring fails.
  console.warn('WRI', 'registerAppLaunchedListener failed; using delayed startup fallback', err);
}

// Fallback for edge-cases where app launched events are swallowed.
// Keep this intentionally late to avoid triggering Bridge-not-loaded redboxes.
setTimeout(() => {
  if (!hasNavigationLaunchSignal) {
    console.warn('WRI', 'onAppLaunched signal not observed; using delayed fallback');
    onNavigationReady();
  }
}, 8000);

export default app;
