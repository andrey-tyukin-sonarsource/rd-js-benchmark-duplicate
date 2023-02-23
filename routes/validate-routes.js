const levenshtein = require("fast-levenshtein");

/**
 * Finds all routes that are mentioned in the examples, but are not in the
 * list of `allRoutes`.
 *
 * @param exampleCategories array of example categories
 * @param allRoutes array of routes
 * @return list of objects with two entries each:
 *         missing route and most similar existing route (can be undefined)
 */
function findMissingRoutes(exampleCategories, allRoutes) {
  const lookupSet = new Set(allRoutes);
  const missingRoutes = [];
  for (let c of exampleCategories) {
    for (let e of c.examples) {
      for (let h of e.handlers) {
        if (!lookupSet.has(h.route)) {
          const similar = findClosest(h.route, allRoutes);
          missingRoutes.push({
            missing: h.route,
            similar,
          });
        }
      }
    }
  }
  return missingRoutes;
}

/**
 * Finds the most similar existing route to the missing route.
 */
function findClosest(missingRoute, allRoutes) {
  let closest = undefined;
  let minDist = Number.POSITIVE_INFINITY;
  for (let r of allRoutes) {
    const d = levenshtein.get(missingRoute, r);
    if (d < minDist) {
      minDist = d;
      closest = r;
    }
  }
  return closest;
}

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
  return res;
}

/**
 * Traverses all example definitions, collects duplicated routes.
 */
function findDuplicateRoutes(exampleCategories) {
  const result = [];
  const alreadySeenRoutes = new Set();
  for (let c of exampleCategories) {
    for (let e of c.examples) {
      for (let h of e.handlers) {
        if (alreadySeenRoutes.has(h.route)) {
          result.push(h.route);
        }
        alreadySeenRoutes.add(h.route);
      }
    }
  }
  return result;
}

/**
 * Checks that all routes mentioned in the category have a corresponding
 * registered handler.
 *
 * If something is missing, prints some information to `stderr` and returns
 * `false`. Otherwise, returns `true`.
 */
function validateRoutes(categories, app) {
  const allRoutes = enumerateRoutes(app);
  const missingRoutes = findMissingRoutes(categories, allRoutes);
  const duplicateRoutes = findDuplicateRoutes(categories);

  if (missingRoutes.length > 0) {
    for (let r of missingRoutes) {
      console.error(`[ERROR] Missing route: ${r.missing}`);
      if (r.similar) {
        console.error(`        Did you mean:  ${r.similar} ?`);
      }
    }
    console.error(`[ERROR] There were ${missingRoutes.length} missing routes.`);
    return false;
  }

  if (duplicateRoutes.length > 0) {
    for (let r of duplicateRoutes) {
      console.error(`[ERROR] Duplicate route: ${r}`);
    }
    console.error(
      `[ERROR] There were ${duplicateRoutes.length} duplicate routes.`
    );
    return false;
  }
  return true;
}

module.exports = validateRoutes;
