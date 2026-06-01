import fetch from './fetchWithTimeout';

// Any HTTP response (including 4xx/5xx) means we have internet connectivity.
// We use a 5-second timeout: long enough to get a reply, short enough that
// the detectNetwork loop doesn't stall for 30 s per URL before giving up.
export default function checkConnectivity(url) {
  return fetch(url, { method: 'HEAD' }, 5000)
    .then(() => true)
    .catch(() => false);
}
