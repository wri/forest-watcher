import detectNetwork from '@redux-offline/redux-offline/lib/defaults/detectNetwork.native';
import Config from 'react-native-config';

import checkConnectivity from 'helpers/networking';

// eslint-disable-next-line import/no-unused-modules
export class DetectNetworkPing {
  static urlList = [
    Config.API_URL,
    'https://www.globalforestwatch.org',
    'https://www.google.com',
    'https://www.facebook.com',
    'https://www.amazon.com'
  ];

  pingToDetectNetwork = (dispatch, urlIndex) => connection => {
    /*
      This is being called when the connection status is updated (like when the WiFi / LTE is being enabled / disabled).
      If everything is off, then the connection would be offline so there’d be no need to continue.
      When it detects that WiFi or LTE has been enabled again, it should become true and then we can check for internet reachability.
      Redux-offline should handle all of that internally.
    */
    if (!connection.online) {
      dispatch(connection);
      return null;
    }

    // Get URL based on current attempt number.
    const url = DetectNetworkPing.urlList[urlIndex % DetectNetworkPing.urlList.length];

    // Attempt fetch with a short timeout.
    return checkConnectivity(url).then(connected => {
      // If we've got a connection, update the redux state.
      if (connected) {
        dispatch({ ...connection, online: true });
        return;
      }

      if (urlIndex < DetectNetworkPing.urlList.length - 1) {
        // Try the next URL before deciding we're offline.
        this.pingToDetectNetwork(dispatch, urlIndex + 1)(connection);
        return;
      } else {
        // All URLs failed. NetInfo already confirmed a network interface is up
        // (connection.online === true), so trust that rather than blocking the
        // offline queue indefinitely. Servers may legitimately reject HEAD.
        dispatch({ ...connection, online: true });
        return;
      }
    });
  };

  /**
   *  Starts the network detection, with the starting URL index of 0.
   */
  start = dispatch => detectNetwork(this.pingToDetectNetwork(dispatch, 0));
}

const detector = new DetectNetworkPing();

export default detector.start;
