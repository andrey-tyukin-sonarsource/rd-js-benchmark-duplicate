/** Examples related to variables. */

const express = require("express");
const router = express.Router();
const common = require("./common-examples");
const secret = require("./secret");
const examples = [];

/** Check whether tainted values fed directly into sink are detected. */
router.get("/source-directly-into-sink", (req, res) => {
  // The "input" is a request parameter sent with the GET-request.
  // See the `form` in `./public/index.html`, it sends the `input`.
  // Putting tainted values into `eval` is clearly a security vulnerability.
  res.send("" + eval(req.query.input));
});

/**
 * Check that saving tainted values in a local `const` variable and
 * then feeding them into sink is detected.
 */
router.get("/source-saved-to-tainted", (req, res) => {
  const tainted = req.query.input;
  res.send("" + eval(tainted));
});

examples.push({
  heading: "Single local constant variable",
  description: `
    A tainted value is stored to a local <code>const tainted</code> variable,
    and then <code>tainted</code> is fed into a sink.
  `,
  handlers: [
    {
      description: `
        This handler will evaluate any input that it's given.
      `,
      route: "/variables/source-saved-to-tainted",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
  ],
});

/**
 * Check that passing the tainted value through intermediate variables
 * does not lose the taint.
 */
router.get("/intermediate-const", (req, res) => {
  const tainted = req.query.input;
  const intermediate = tainted;
  res.send("Answer: " + eval(intermediate));
});

module.exports = {
  router,
  categories: [
    {
      heading: "Variables",
      description: `
      Local variable
      (<code>let</code>/<code>var</code>/<code>const</code> etc.)
    `,
      examples,
    },
  ],
};
