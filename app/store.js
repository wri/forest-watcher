import { createStore, compose, applyMiddleware } from 'redux';
import { combinedReducer } from 'combinedReducer';
import offline from 'offline';
import offlineChain from 'redux-offline-chain';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';

import migrationEnhancer from './migrate';

import { rootSaga } from 'sagas';

// Reactotron is lazy-required inside __DEV__ blocks only, so its module-level
// code (which accesses Platform.constants / TurboModuleRegistry) never runs
// until after the native runtime is fully initialised.
let Reactotron = null;

if (__DEV__) {
  const ReactotronLib = require('reactotron-react-native'); // eslint-disable-line
  const { trackGlobalErrors, networking, openInEditor, asyncStorage } = ReactotronLib;
  const sagaPlugin = require('reactotron-redux-saga'); // eslint-disable-line — module is the function directly, no .default
  const { reactotronRedux } = require('reactotron-redux'); // eslint-disable-line

  Reactotron = ReactotronLib.default;
  Reactotron.configure()
    .use(reactotronRedux())
    .use(sagaPlugin())
    .use(trackGlobalErrors())
    .use(networking())
    .use(openInEditor())
    .use(asyncStorage())
    .connect()
    .clear();
  window.tron = Reactotron; // eslint-disable-line
}

const sagaMonitor = __DEV__ && Reactotron && Reactotron.createSagaMonitor();
const sagaMiddleware = createSagaMiddleware({ sagaMonitor });

const authMiddleware =
  ({ getState }) =>
  next =>
  action =>
    action && action.type && action.type.endsWith('REQUEST')
      ? next({ ...action, auth: getState().user.token })
      : next(action);

const middlewareList = [thunk, authMiddleware, sagaMiddleware];

function createAppStore(startApp) {
  const {
    middleware: offlineMiddleware,
    enhanceReducer,
    enhanceStore
  } = offline({
    persistCallback: startApp
  });
  const middleware = applyMiddleware(...middlewareList, offlineMiddleware, offlineChain);
  const storeEnhancers = [enhanceStore, migrationEnhancer, middleware];
  if (__DEV__ && Reactotron) {
    storeEnhancers.push(Reactotron.createEnhancer());
  }
  let composeEnhancers = compose;

  if (__DEV__) {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  }
  return createStore(enhanceReducer(combinedReducer), composeEnhancers(...storeEnhancers));
}

createAppStore.runSagas = () => sagaMiddleware.run(rootSaga);

export default createAppStore;
