/** Examples related to interprocedurality. */

const express = require("express");
const router = express.Router();
const secret = require("./secret");
const common = require("./common-examples");
const examples = [];

function customIdentity(x) {
  if (3 + 10 > 5) {
    return x;
  }

  return "";
}

router.get("/call-identity-with-if-true", (req, res) => {
  let tainted = req.query.input;
  tainted = customIdentity(tainted);
  res.send("" + eval(tainted));
});

examples.push({
  heading: `
    Interprocedural taint flow through an identity with <code>if-true</code>
  `,
  description: `
    Passes a value into an identity function that contains a "confusing"
    <code>if-true</code> condition.
  `,
  handlers: [
    {
      heading: `<code>function (x) { if (true) { return x; } ; return ''; }</code>
         should propagate the value unchanged
        `,
      route: "/interproc/call-identity-with-if-true",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
  ],
});

function conditionalPassthrough(b, x) {
  if (b) {
    return x;
  }

  // Return an expression that can be evaluated by `eval`
  return "'harmless'";
}

router.get("/conditional-passthrough-true", (req, res) => {
  let tainted = req.query.input;
  tainted = conditionalPassthrough(true, tainted);
  res.send("" + eval(tainted));
});

router.get("/conditional-passthrough-false", (req, res) => {
  let tainted = req.query.input;
  tainted = conditionalPassthrough(false, tainted);
  res.send("" + eval(tainted));
});

examples.push({
  heading: `
    Conditional pass-through
  `,
  description: `
    Passes the tainted value through the function
    <code>function (b, x) { if (b) { return x }; return "" }</code>
    for various <code>b</code>.
  `,
  handlers: [
    {
      heading: `With <code>b = true</code> (function behaves like identity)`,
      route: "/interproc/conditional-passthrough-true",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: `With <code>b = false</code>, the function is always harmless`,
      route: "/interproc/conditional-passthrough-false",
      description: "",
      testCases: common.FP_TEST_CASE,
    },
  ],
});

module.exports = {
  router,
  categories: [
    {
      heading: "Interprocedurality",
      description: `Testing basic taint flow between multiple methods`,
      examples,
    },
  ],
};
