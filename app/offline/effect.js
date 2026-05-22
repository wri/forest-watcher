import defaultEffect from '@redux-offline/redux-offline/lib/defaults/effect';
import FWError from 'helpers/fwError';
import * as Sentry from '@sentry/react-native';

const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

const deserializeOptions = {
  keyForAttribute: 'camelCase'
};

const LOG_PREFIX = '[FW:API]';
const DEBUG_LOG_REQUESTS = typeof __DEV__ !== 'undefined' && __DEV__ && process.env.DEBUG_LOG_REQUESTS === 'true';

function logRequest(req, action) {
  if (!DEBUG_LOG_REQUESTS) return;
  const { url, method = 'GET', headers, body } = req;
  const safeHeaders = { ...headers };
  if (safeHeaders.Authorization) {
    safeHeaders.Authorization = safeHeaders.Authorization.replace(/Bearer .{20}.*/, 'Bearer [REDACTED]');
  }
  console.group(`${LOG_PREFIX} ➡️  ${method} ${url}`);
  console.log('Action type:', action?.type);
  console.log('Headers:', safeHeaders);
  if (body) {
    try {
      console.log('Body:', typeof body === 'string' ? JSON.parse(body) : body);
    } catch {
      console.log('Body (raw):', body);
    }
  }
  console.groupEnd();
}

function logResponse(url, data, duration) {
  if (!DEBUG_LOG_REQUESTS) return;
  console.group(`${LOG_PREFIX} ✅ Response: ${url} (${duration}ms)`);
  console.log('Payload:', JSON.stringify(data, null, 2).slice(0, 2000));
  console.groupEnd();
}

function logError(url, err, duration) {
  if (!DEBUG_LOG_REQUESTS) return;
  console.group(`${LOG_PREFIX} ❌ Error: ${url} (${duration}ms)`);
  console.log('Message:', err?.message ?? String(err));
  console.log('Status:', err?.status);
  console.log('Full error:', JSON.stringify(err));
  console.groupEnd();
}

export default function effect({ url, headers, errorCode, deserialize = true, ...params }, { auth, ...action }) {
  if (url && typeof url === 'string') {
    const authedHeaders = { ...headers };
    // Only add `Authorization` header if don't already have x-api-token header
    if (!authedHeaders['x-api-key']) {
      authedHeaders['Authorization'] = `Bearer ${auth}`;
    }
    const req = {
      ...params,
      url,
      headers: authedHeaders
    };

    logRequest(req, action);

    const start = Date.now();
    const canDeserialize = res => res && typeof res === 'object' && res.data && deserialize;
    return defaultEffect(req, action)
      .then(data => {
        logResponse(url, data, Date.now() - start);
        return canDeserialize(data) ? new JSONAPIDeserializer(deserializeOptions).deserialize(data) : data;
      })
      .catch(err => {
        logError(url, err, Date.now() - start);
        Sentry.captureException(err);
        if (errorCode) {
          throw new FWError({ message: err, status: errorCode });
        }
        throw err;
      });
  }

  throw new TypeError();
}

