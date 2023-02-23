/** Examples related to "new". */

const express = require("express");
const router = express.Router();
const secret = require("./secret");
const common = require("./common-examples");

const examples = [];

router.get("/new-return-fn", (req, res) => {
  var tainted = req.query.input;
  function C() {
    this.p = "harmless";
    return { p: tainted };
  }

  var c = new C();

  // Vulnerable
  res.send("" + eval(c.p));
});

router.get("/new-return-fp", (req, res) => {
  var tainted = req.query.input;
  function C() {
    this.p = tainted;
    return { p: "'harmless'" };
  }

  var c = new C();

  // Non-vulnerable
  res.send("" + eval(c.p));
});

examples.push({
  heading: "Returning from constructor",
  description: ``,
  handlers: [
    {
      heading: "False negative check",
      route: "/new-keyword/new-return-fn",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check",
      route: "/new-keyword/new-return-fp",
      description: "",
      testCases: common.FP_TEST_CASE,
    },
  ],
});

module.exports = {
  router,
  categories: [
    {
      heading: "New",
      description: `The <code>new</code>-keyword, <code>prototype</code>, <code>return</code> in constructors etc.`,
      examples,
    },
  ],
};
