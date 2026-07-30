/**
 * Shim for react-native/Libraries/Network/XHRInterceptor.
 * This internal module was removed in RN 0.73+. Reactotron's networking plugin
 * imports it directly; this no-op shim keeps the bundle resolving while
 * gracefully disabling Reactotron's XHR network inspection.
 */
const XHRInterceptor = {
  setSendCallback: () => {},
  setResponseCallback: () => {},
  setOpenCallback: () => {},
  setRequestHeaderCallback: () => {},
  setHeaderReceivedCallback: () => {},
  enableInterception: () => {},
  disableInterception: () => {},
  isInterceptorEnabled: false,
};

module.exports = XHRInterceptor;
