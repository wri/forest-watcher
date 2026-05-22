import Config from 'react-native-config';
import { Platform } from 'react-native';

import { appleAuth } from '@invertase/react-native-apple-authentication';

const googleRedirectScheme =
  Platform.OS === 'android' && __DEV__
    ? Config.LOGIN_GOOGLE_REDIRECT_SCHEMA_DEBUG || `${Config.LOGIN_GOOGLE_REDIRECT_SCHEMA}.debug`
    : Config.LOGIN_GOOGLE_REDIRECT_SCHEMA;

export default {
  apple: {
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME]
  },
  google: {
    issuer: 'https://accounts.google.com',
    clientId: Config.LOGIN_GOOGLE_CLIENT_ID,
    redirectUrl: `${googleRedirectScheme}:/oauth2redirect/google`,
    scopes: ['openid', 'profile', 'email']
  },
  facebook: ['public_profile', 'email']
};
