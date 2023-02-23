/**
 * Enumerates routes registered through `Router`s
 * (e.g. `/arrays/single-element-array`).
 */
function enumerateRoutes(app) {
  // Implementation note: relies on the assumptions that all `router`s are
  // "on the first level" (not nested), and that all non-`/`-parts of the
  // routes consist of lower case alphanumeric characters and dashes.

  const res = [];
  for (let middleware of app._router.stack) {
    if (middleware.name === "router") {
      const routerPath = middleware.regexp.toString().match(/[a-z0-9-]+/)[0];
      for (let handler of middleware.handle.stack) {
        if (handler.route) {
          res.push(`/${routerPath}${handler.route.path}`);
        }
      }
    }
  }
}

module.exports = enumerateRoutes;
