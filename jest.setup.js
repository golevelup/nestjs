/**
 * @note This file is a workaround for an issue with Jest v27 and the `@google-cloud/pubsub` library.
 *
 * The `@google-cloud/pubsub` library and its dependencies (like `google-auth-library`)
 * require the global `Headers` and `fetch` objects, which are part of the standard Web API.
 *
 * Modern versions of Node.js (18+) and Jest (28+) provide these globals in their test environment.
 * However, this project uses Jest v27, and its `node` test environment does not include them,
 * leading to "Headers is not defined" errors.
 *
 * This setup file polyfills `Headers` and `fetch` using `node-fetch` before the tests run,
 * resolving the issue without upgrading Jest package.
 */

if (typeof global.Headers === 'undefined') {
  const { Headers } = require('node-fetch');
  global.Headers = Headers;
}

if (typeof global.fetch === 'undefined') {
  const fetch = require('node-fetch');
  global.fetch = fetch;
  global.Response = fetch.Response;
  global.Request = fetch.Request;
}
