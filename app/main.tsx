import { Alert, AppState, NativeModules, Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Provider } from 'react-redux';
import Theme from 'config/theme';
import { registerScreens } from 'screens';
import createStore from 'store';
import { setupCrashLogging } from './crashes';
import { setI18nConfig } from 'locales';
import i18n from 'i18next';
import { appleAuth } from '@invertase/react-native-apple-authentication';

import {
  GFWLocationAuthorizedAlways,
  initialiseLocationFramework,
  checkLocationStatus,
  showAppSettings,
  showLocationSettings,
  startTrackingLocation
} from 'helpers/location';
import { discardActiveRoute } from 'redux-modules/routes';
import Config from 'react-native-config';
import MapboxGL from '@rnmapbox/maps';
import { trackRouteFlowEvent } from 'helpers/analytics';
import { launchAppRoot } from 'screens/common';
import { migrateFilesFromV1ToV2 } from './migrate';
import { SET_HAS_MIGRATED_V1_FILES } from 'redux-modules/app';
import { logout } from 'redux-modules/user';
import * as Sentry from '@sentry/react-native';

type AppStore = ReturnType<typeof createStore>;
const NAVIGATION_STARTUP_RETRY_ATTEMPTS = 40;
const NAVIGATION_STARTUP_RETRY_DELAY_MS = 250;

// Disable ios warnings
// console.disableYellowBox = true;

// Show request in chrome network tool
// GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

// eslint-disable-next-line import/no-unused-modules
export default class App {
  private store: AppStore | null;
  private currentAppState: string;
  private hasBootstrappedStore: boolean;
  private hasRegisteredScreens: boolean;
  private navigationReady: boolean;
  private pendingLaunchRoot: boolean;

  constructor() {
    this.store = null;
    this.currentAppState = 'background';
    this.hasBootstrappedStore = false;
    this.hasRegisteredScreens = false;
    this.navigationReady = false;
    this.pendingLaunchRoot = false;
    // onCredentialRevoked isn't reliably called, so we also check in `launchRoot` and `_handleAppStateChange` and log the
    // user out there if necessary
    if (appleAuth.isSupported) {
      appleAuth.onCredentialRevoked(this._onAppleLoginCredentialRevoked);
    }
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  onNavigationReady = () => {
    this.navigationReady = true;

    if (!this.pendingLaunchRoot || !this.store) {
      return;
    }

    this.pendingLaunchRoot = false;
    this.launchRoot().catch(err => {
      console.warn('WRI', 'launchRoot after navigation-ready failed', err);
    });
  };

  async launchRoot() {
    setI18nConfig();

    // Prevent a known startup deadlock where RNN keeps the splash screen
    // visible while waiting for first render on certain RN/RNN combinations.
    await this.runNavigationStartupCommandWithRetry(() =>
      Navigation.setDefaultOptions({
        animations: {
          setRoot: {
            waitForRender: false
          }
        }
      } as any)
    );

    await this.runNavigationStartupCommandWithRetry(() => Navigation.setDefaultOptions(Theme.navigator.styles as any));

    const state = this.store.getState();
    let screen = 'ForestWatcher.Home';
    if (!state.user.loggedIn) {
      screen = 'ForestWatcher.Login';
    } else if (state.app.synced) {
      screen = 'ForestWatcher.Dashboard';
    }

    this.setupMapbox();
    await this.runNavigationStartupCommandWithRetry(() => launchAppRoot(screen));
    await this._handleAppStateChange('active');

    // Don't block initial UI on Apple credential checks; verify after root is visible.
    if (state.user.loggedIn && state.user.socialNetwork === 'apple' && state.user.userId && appleAuth.isSupported) {
      try {
        // using try-catch for error when user does not sign in to icloud
        // Issue: https://github.com/invertase/react-native-apple-authentication/issues/89
        const credentialState = await appleAuth.getCredentialStateForUser(state.user.userId);
        if (credentialState !== appleAuth.State.AUTHORIZED) {
          this.store.dispatch(logout('apple'));
          await this.runNavigationStartupCommandWithRetry(() => launchAppRoot('ForestWatcher.Home'));
        }
      } catch (error) {
        console.warn('WRI', 'Error getting credential state', error);
      }
    }

    try {
      const hasMigratedFiles = state.app.hasMigratedV1Files;
      if (!hasMigratedFiles) {
        await migrateFilesFromV1ToV2(this.store.dispatch);
        this.store.dispatch({
          type: SET_HAS_MIGRATED_V1_FILES
        });
      }
    } catch (err) {
      console.warn('WRI', 'Could not migrate files', err);
      Sentry.captureException(err);
    }
  }

  async runNavigationStartupCommandWithRetry(command: () => Promise<any> | any) {
    for (let attempt = 1; attempt <= NAVIGATION_STARTUP_RETRY_ATTEMPTS; attempt += 1) {
      try {
        await command();
        return;
      } catch (err) {
        const isLastAttempt = attempt === NAVIGATION_STARTUP_RETRY_ATTEMPTS;

        if (isLastAttempt) {
          throw err;
        }

        await new Promise(resolve => setTimeout(resolve, NAVIGATION_STARTUP_RETRY_DELAY_MS));
      }
    }
  }

  _onAppleLoginCredentialRevoked = () => {
    // As this can be called before the store is initialised, ensure we have a store before continuing.
    if (!this.store) {
      return;
    }
    this.store.dispatch(logout('apple'));
    launchAppRoot('ForestWatcher.Home');
  };

  _handleAppStateChange = async nextAppState => {
    // As this can be called before the store is initialised, ensure we have a store before continuing.
    if (!this.store) {
      return;
    }

    const hasTransitionedToForeground = this.currentAppState.match(/inactive|background/) && nextAppState === 'active';
    this.currentAppState = nextAppState;

    if (!hasTransitionedToForeground) {
      return;
    }

    const state = this.store.getState();

    // If we're logged in with Apple Login
    if (state.user.loggedIn && state.user.socialNetwork === 'apple' && state.user.userId && appleAuth.isSupported) {
      // Check credential state
      const credentialState = await appleAuth.getCredentialStateForUser(state.user.userId);
      // If we're not authorized, then log the user out!
      if (credentialState !== appleAuth.State.AUTHORIZED) {
        this.store.dispatch(logout('apple'));
        launchAppRoot('ForestWatcher.Home');
      }
    }

    const activeRoute = state.routes.activeRoute;

    // If there was no active route then we are done
    if (!activeRoute) {
      return;
    }

    // If we have an active route in state it means we should be tracking locations for it...
    const locationStatus = await checkLocationStatus();
    let trackingIsBlocked = false;

    // If the tracker is not currently running then find out what the user wants to do and possibly start it
    if (!locationStatus.isRunning) {
      // Ask the user if they want to resume tracking
      const shouldResume = await new Promise(resolve => {
        Alert.alert(i18n.t('routes.resumeTrackingDialogTitle'), i18n.t('routes.resumeTrackingDialogMessage'), [
          { text: i18n.t('routes.resumeTrackingDialogPositiveButton'), onPress: () => resolve(true) },
          {
            text: i18n.t('routes.resumeTrackingDialogNegativeButton'),
            onPress: () => resolve(false)
          }
        ]);
      });

      if (!shouldResume) {
        trackRouteFlowEvent('discardedOnLaunch');
        this.store.dispatch(discardActiveRoute());
        return;
      }

      // Attempt to start tracking. If it succeeds then we are done
      try {
        await startTrackingLocation(GFWLocationAuthorizedAlways);
        return;
      } catch (err) {
        // Could not start tracking after resuming from background - tell the user to fix their settings
        trackingIsBlocked = true;
      }
    } else {
      trackingIsBlocked =
        !locationStatus.locationServicesEnabled || locationStatus.authorization !== GFWLocationAuthorizedAlways;
    }

    // Show a message saying tracking is paused until they fix the problem, along with buttons to take them to app settings.
    if (trackingIsBlocked) {
      Alert.alert(i18n.t('routes.backgroundErrorDialogTitle'), i18n.t('routes.backgroundErrorDialogMessage'), [
        { text: i18n.t('commonText.ok') },
        {
          text: i18n.t('routes.insufficientPermissionsDialogOpenAppSettings'),
          onPress: showAppSettings
        },
        ...Platform.select({
          android: [
            {
              text: i18n.t('routes.insufficientPermissionsDialogOpenDeviceSettings'),
              onPress: showLocationSettings
            }
          ],
          ios: [{}]
        })
      ]);
    }
  };

  /**
   * Performs one-time setup tasks needed to launch the application
   *
   * If called further times it will only setup the UI
   */
  async setupApp() {
    // If we've already setup the app then store will be non-null, and we just need to launch a UI root
    if (this.store) {
      if (this.navigationReady) {
        this.launchRoot();
      } else {
        this.pendingLaunchRoot = true;
      }
      return;
    }

    if (!__DEV__) {
      await setupCrashLogging();
    }

    const store = createStore(async () => {
      await this.bootstrapStoreAndLaunch(store);
    });

    // Register screens early; actual root launch is deferred until RNN signals
    // app-launched to avoid Bridge-not-loaded startup errors.
    if (!this.hasRegisteredScreens) {
      this.hasRegisteredScreens = true;
      this.store = store;
      registerScreens(store, Provider);
      if (this.navigationReady) {
        this.launchRoot().catch(err => {
          console.warn('WRI', 'initial root launch failed', err);
        });
      } else {
        this.pendingLaunchRoot = true;
      }
    }

    // Some older persistence paths can stall before persistCallback runs.
    // Continue startup after a short grace period so splash cannot hang forever.
    setTimeout(() => {
      this.bootstrapStoreAndLaunch(store);
    }, 4000);
  }

  bootstrapStoreAndLaunch = async (store: AppStore) => {
    if (this.hasBootstrappedStore) {
      return;
    }

    try {
      this.hasBootstrappedStore = true;
      this.store = store;

      // Render a root as early as possible so startup side effects cannot
      // leave the native splash controller on screen.
      if (this.navigationReady) {
        await this.launchRoot();
      } else {
        this.pendingLaunchRoot = true;
      }

      initialiseLocationFramework();
      createStore.runSagas();
    } catch (err) {
      if (this.navigationReady) {
        try {
          await this.runNavigationStartupCommandWithRetry(() => launchAppRoot('ForestWatcher.Login'));
        } catch (fallbackErr) {
          console.warn('WRI', 'fallback root launch failed', fallbackErr);
        }
      } else {
        this.pendingLaunchRoot = true;
      }

      throw err;
    }
  };

  setupMapbox = () => {
    MapboxGL.setAccessToken(Config.MAPBOX_TOKEN);
    if (Platform.OS === 'android') {
      NativeModules.FWMapbox.installOfflineModeInterceptor(
        this.store.getState().app.offlineMode,
        Config.MAPBOX_TOKEN
      );
    }
  };
}

