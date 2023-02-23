/** Examples related to arrays. */

const express = require("express");
const router = express.Router();
const secret = require("./secret");
const common = require("./common-examples");
const { reportIssue } = require("./issue-reporting");

const examples = [];

router.get("/let-in-block-scope-fn-check", (req, res) => {
  let tainted = req.query.input;

  {
    let tainted = "";
  }

  res.send("" + eval(tainted));
});

router.get("/let-in-block-scope-fp-check", (req, res) => {
  let untainted = req.query.input;

  {
    untainted = "'harmless'";
  }

  res.send("" + eval(untainted));
});

examples.push({
  heading: "Let-declaration and block-scopes",
  description: `
    Check whether <code>let x = ...; { let x = ...; }</code> is handled
    correctly.
  `,
  handlers: [
    {
      heading: "FN check: <code>let x = tainted; { let x = harmless }</code>",
      route: "/scopes/let-in-block-scope-fn-check",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "FP check: <code>let x = harmless; { let x = tainted }</code>",
      route: "/scopes/let-in-block-scope-fp-check",
      description: "",
      testCases: common.FP_TEST_CASE,
    },
  ],
});

router.get("/hoisting-fn-check", (req, res) => {
  let tainted = req.query.input;

  // use hoisted function before its declaration in current scope
  const y = hoistedFunction(tainted);

  function hoistedFunction(x) {
    return x;
  }

  res.send("" + eval(y));
});

router.get("/hoisting-fp-check", (req, res) => {
  let tainted = req.query.input;

  // This overwrites the hoisted function, despite the declaration coming later
  var f = function () {
    return "'harmless'";
  };

  const y = f(tainted);

  function f(x) {
    return x;
  }

  res.send("" + eval(y));
});

examples.push({
  heading: "Hoisted functions",
  description: `
    Check whether function hoisting is handled correctly.
  `,
  handlers: [
    {
      heading: "FN check: use hoisted function before its declaration",
      route: "/scopes/hoisting-fn-check",
      description: "Invokes <code>f</code> before declaring it.",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "FP check: overwrite by <code>var</code>",
      route: "/scopes/hoisting-fp-check",
      description: `Overwrites a hoisted <code>f</code> by a variable declaration with same name.`,
      testCases: common.FP_TEST_CASE,
    },
  ],
});

router.get("/global-context-fn", (req, res) => {
  function createModule() {
    m = {
      dangerousOperation() {
        return req.query.input;
      },
    };
  }

  createModule();

  // Vulnerable
  res.send("" + eval(m.dangerousOperation()));
});

router.get("/global-context-fp", (req, res) => {
  function createModule() {
    m = {
      dangerousOperation() {
        return req.query.input;
      },
    };
  }

  function rewriteModule() {
    m = {
      dangerousOperation() {
        return '"harmless"';
      },
    };
  }

  createModule();
  rewriteModule();

  // Non-vulnerable
  res.send("" + eval(m.dangerousOperation()));
});

examples.push({
  heading: "Global context",
  description: `
    Creating and using module <code>m = ...</code> directly in global scope.
  `,
  handlers: [
    {
      heading: "FN check",
      route: "/scopes/global-context-fn",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "FP check",
      route: "/scopes/global-context-fp",
      description: "",
      testCases: common.FP_TEST_CASE,
    },
  ],
});

module.exports = {
  router,
  categories: [
    {
      heading: "Scope",
      description: `
        Testing variable scoping.
      `,
      examples,
    },
  ],
};
