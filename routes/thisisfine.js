/** Examples related to `this`-keyword. */

const express = require("express");
const router = express.Router();
const secret = require("./secret");
const common = require("./common-examples");

const examples = [];

router.get("/this-basic-fn", (req, res) => {
  let obj = {
    dangerous: req.query.input,
    notDangerous: "'harmless'",
    get: function () {
      return this.dangerous;
    },
  };

  const dangerous = 0;

  res.send("" + eval(obj.get()));
});

router.get("/this-basic-fp", (req, res) => {
  let obj = {
    dangerous: req.query.input,
    notDangerous: "'harmless'",
    get: function () {
      return this.notDangerous;
    },
  };

  const dangerous = 0;

  res.send("" + eval(obj.get()));
});

examples.push({
  heading: "Basic <code>this</code> usage with plain objects",
  description: `
    The <code>this</code>-keyword referring to the object produced by the
    same object literal that enclosed the function.
  `,
  handlers: [
    {
      heading: "Accessing a tainted value through <code>this</code>",
      route: "/thisisfine/this-basic-fn",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "Accessing a harmless value through <code>this</code>",
      route: "/thisisfine/this-basic-fp",
      description: "",
      testCases: common.FP_TEST_CASE,
    },
  ],
});

router.get("/this-dynamic-binding-in-functions", (req, res) => {
  const tainted = req.query.input;

  function getter() {
    return this.dangerous;
  }

  res.send("" + eval({ dangerous: tainted, get: getter }.get()));
});

examples.push({
  heading: "Dynamic binding of <code>this</code> in <code>function</code>s",
  description: `
    Check that the <code>this</code> is bound dynamically when it occurs in
    <code>function</code>s.
  `,
  handlers: [
    {
      heading:
        "Create a function with <code>this</code>, attach it to object, invoke",
      route: "/thisisfine/this-dynamic-binding-in-functions",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
  ],
});

router.get("/this-lexical-scoping-in-arrow-literals", (req, res) => {
  const tainted = req.query.input;

  const obj = {
    x: tainted,
    f: function () {
      return () => this.x;
    },
  };

  objXGetter = obj.f(); // `this` is dynamically bound here

  const unrelatedObject = {
    x: "'harmless'",
    getX: objXGetter,
  };

  const v = unrelatedObject.getX(); // `this` not bound here, it still refers to `obj`

  res.send("" + eval(v));
});

examples.push({
  heading: "Lexical scoping of <code>this</code> in arrow literals",
  description: `
    Check that the <code>this</code> is bound lexically when it occurs in
    arrow literals such as <code>() => this.prop</code>.
  `,
  handlers: [
    {
      heading: "",
      route: "/thisisfine/this-lexical-scoping-in-arrow-literals",
      description: `Create a lambda nested within <code>function</code>,
      bind <code>this</code> dynamically, then move the returned lambda
      elsewhere, make sure that it still refers to the first dynamically bound
      receiver.`,
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
  ],
});

router.get("/transplant-method-fn", (req, res) => {
  var tainted = req.query.input;
  var obj1 = {
    a() {
      return tainted;
    },
    b() {
      return this.a();
    },
  };
  var obj2 = {
    a() {
      return 0;
    },
  };

  obj2.b = obj1.b;

  // Vulnerable
  res.send("" + eval(obj1.b()));
});

router.get("/transplant-method-fp", (req, res) => {
  var tainted = req.query.input;
  var obj1 = {
    a() {
      return tainted;
    },
    b() {
      return this.a();
    },
  };
  var obj2 = {
    a() {
      return '"harmless"';
    },
  };

  obj2.b = obj1.b;

  // Not vulnerable
  res.send("" + eval(obj2.b()));
});

examples.push({
  heading: "Transplanting 'generic' methods between objects",
  description: `
    Check that the <code>this</code> is bound lexically when it occurs in
    arrow literals such as <code>() => this.prop</code>.
  `,
  handlers: [
    {
      heading: "Transplanting method between two objects: FN check",
      route: "/thisisfine/transplant-method-fn",
      description: ``,
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "Transplanting method between two objects: FP check",
      route: "/thisisfine/transplant-method-fp",
      description: "",
      testCases: common.FP_TEST_CASE,
    },
  ],
});

router.get("/this-in-function-invocations-without-receiver-fn", (req, res) => {
  function f() {
    this.m = {
      dangerousOperation() {
        return req.query.input;
      },
    };
  }

  f();

  // Vulnerable
  res.send("" + eval(m.dangerousOperation()));
});

router.get("/this-in-function-invocations-without-receiver-fp", (req, res) => {
  function f() {
    this.m = {
      dangerousOperation() {
        return req.query.input;
      },
    };
  }

  function g() {
    this.m = {
      dangerousOperation() {
        return "'harmless'";
      },
    };
  }

  f();
  g();

  // Non-vulnerable
  res.send("" + eval(m.dangerousOperation()));
});

examples.push({
  heading:
    "Using <code>this</code> in functions that are invoked without receiver",
  description: `
    When a function <code>f</code> is invoked as <code>f()</code> on its own,
    not as a method on a receiver, the <code>this</code> should be bound to 
    the global context.
  `,
  handlers: [
    {
      heading: "FN check",
      route: "/thisisfine/this-in-function-invocations-without-receiver-fn",
      description: ``,
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "FP check",
      route: "/thisisfine/this-in-function-invocations-without-receiver-fp",
      description: "",
      testCases: common.FP_TEST_CASE,
    },
  ],
});

module.exports = {
  router,
  categories: [
    {
      heading: "This",
      description: `What does <code>this</code> refer to?...`,
      examples,
    },
  ],
};
