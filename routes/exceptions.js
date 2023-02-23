/** Examples related to exceptions. */

const express = require("express");
const router = express.Router();
const secret = require("./secret");
const common = require("./common-examples");

const examples = [];

router.get("/intramethod-fn", (req, res) => {
  try {
    throw req.query.input;
  } catch (e) {
    res.send("" + eval(e));
  }
});

examples.push({
  heading: "Throw and immediately catch an exception within same method",
  description: ``,
  handlers: [
    {
      heading: "False negative check",
      route: "/exceptions/intramethod-fn",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
  ],
});

router.get("/intramethod-with-new-fn", (req, res) => {
  try {
    throw new Error(req.query.input);
  } catch (e) {
    res.send("" + eval(e.message));
  }
});

router.get("/intramethod-with-new-fp", (req, res) => {
  try {
    throw new Error(req.query.input);
  } catch (e) {
    res.send("" + eval(e.thisDoesNotExist));
  }
});

examples.push({
  heading:
    "Throw and immediately catch an exception within same method (with <code>new</code>)",
  description: ``,
  handlers: [
    {
      heading: "False negative check",
      route: "/exceptions/intramethod-with-new-fn",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check",
      route: "/exceptions/intramethod-with-new-fp",
      description: "",
      testCases: common.fpTestCase("undefined"),
    },
  ],
});

function throwIt(x) {
  throw x;
}

router.get("/throw-between-methods", (req, res) => {
  try {
    throwIt(req.query.input);
  } catch (e) {
    res.send("" + eval(e));
  }
});

examples.push({
  heading: "Throw exception between methods",
  description: ``,
  handlers: [
    {
      heading:
        "Call a function that unconditionally throws the value passed to it",
      route: "/exceptions/throw-between-methods",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
  ],
});

function catcher(thrower, v) {
  try {
    thrower(v);
  } catch (e) {
    return e;
  }
}

router.get("/throw-from-lambda", (req, res) => {
  const t = catcher((x) => {
    throw x;
  }, req.query.input);
  res.send("" + eval(t));
});

examples.push({
  heading: "Throw exception from a lambda passed as argument",
  description: ``,
  handlers: [
    {
      heading: "Call a parameter that throws the value passed to it",
      route: "/exceptions/throw-from-lambda",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
  ],
});

module.exports = {
  router,
  categories: [
    {
      heading: "Exceptions",
      description: `Testing support for throwing and catching exceptions.`,
      examples,
    },
  ],
};
