/** Examples related to prototypes & "old skool"-classes before ES6. */

const express = require("express");
const router = express.Router();
const secret = require("./secret");
const common = require("./common-examples");

const examples = [];

function C(v) {
  this.v = v;
}

function getV() {
  return this.v;
}

function setV(v) {
  this.v = v;
}

C.prototype.getV = getV;
C.prototype.setV = setV;

router.get("/cell-constructor-fn", (req, res) => {
  var inst = new C(req.query.input);
  // Vulnerable
  res.send("" + eval(inst.getV()));
});

router.get("/cell-set-fn", (req, res) => {
  var inst = new C("'harmless'");
  inst.setV(req.query.input);
  // Vulnerable
  res.send("" + eval(inst.getV()));
});

router.get("/cell-fp", (req, res) => {
  var inst = new C(req.query.input);
  inst.setV("'harmless'");
  // Non-vulnerable
  res.send("" + eval(inst.getV()));
});

examples.push({
  heading: "Cell with a single mutable property",
  description: `
    Cell with a single mutable property, a getter and a setter accessible
    through <code>prototype</code>.
  `,
  handlers: [
    {
      heading: "False negative check: taint through constructor",
      route: "/prototypes/cell-constructor-fn",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False negative check: taint through getter",
      route: "/prototypes/cell-set-fn",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check",
      route: "/prototypes/cell-fp",
      description: "The passthrough is disabled.",
      testCases: common.FP_TEST_CASE,
    },
  ],
});

module.exports = {
  router,
  categories: [
    {
      heading: "Prototypes",
      description: `
      Test support of <code>prototype</code>, <code>__proto__</code>,
      interaction with <code>new</code> etc.
    `,
      examples,
    },
  ],
};
