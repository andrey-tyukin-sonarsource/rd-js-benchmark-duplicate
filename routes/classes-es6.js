/** Examples related to arrays. */

const express = require("express");
const router = express.Router();
const secret = require("./secret");
const common = require("./common-examples");

const examples = [];

router.get("/constructor-fn", (req, res) => {
  class Foo {
    constructor(aa) {
      this.a = aa;
    }
    bar() {
      return this.a;
    }
  }

  let foo = new Foo(req.query.input);

  // Vulnerable
  res.send("" + eval(foo.bar()));
});

router.get("/constructor-fp", (req, res) => {
  class Foo {
    constructor(aa) {
      this.a = aa;
    }
    bar() {
      return '"harmless"';
    }
  }

  let foo = new Foo(req.query.input);

  // Non-vulnerable
  res.send("" + eval(foo.bar()));
});

examples.push({
  heading: "Constructor support",
  description: `
    Set a value in constructor, access it through a getter.
  `,
  handlers: [
    {
      heading: "False negative check",
      route: "/classes-es6/constructor-fn",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check",
      route: "/classes-es6/constructor-fp",
      description: "",
      testCases: common.FP_TEST_CASE,
    },
  ],
});

class MaybeDangerous {
  constructor(dangerous) {
    this.dangerous = dangerous;
  }

  run(v, res) {
    this.sink(res, this.passthrough(v));
  }

  passthrough(s) {
    if (this.dangerous) {
      return s;
    } else {
      return "'harmless'";
    }
  }

  sink(res, s) {
    res.send("" + eval(s));
  }
}

router.get("/boolean-controlled-passthrough-method-fn-check", (req, res) => {
  const reallyDangerous = new MaybeDangerous(true);
  const v = req.query.input;
  reallyDangerous.run(v, res);
});

router.get("/boolean-controlled-passthrough-method-fp-check", (req, res) => {
  const notDangerous = new MaybeDangerous(false);
  const v = req.query.input;
  notDangerous.run(v, res);
});

examples.push({
  heading: "Class with a Boolean-controlled passthrough",
  description: `
    Test with an instance of a class that has a sink/source/passthrough, and
    where the passthrough is activated through a Boolean value passed to the
    constructor.
  `,
  handlers: [
    {
      heading: "False negative check",
      route: "/classes-es6/boolean-controlled-passthrough-method-fn-check",
      description: "The passthrough is activated.",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check",
      route: "/classes-es6/boolean-controlled-passthrough-method-fp-check",
      description: "The passthrough is disabled.",
      testCases: common.FP_TEST_CASE,
    },
  ],
});

class StaticMaybeDangerous {
  static run(dangerous, s, res) {
    StaticMaybeDangerous.sink(
      res,
      StaticMaybeDangerous.passthrough(dangerous, s)
    );
  }

  static passthrough(dangerous, s) {
    if (dangerous) {
      return s;
    } else {
      return "'harmless'";
    }
  }

  static sink(res, s) {
    res.send("" + eval(s));
  }
}

router.get("/static-boolean-controlled-passthrough-fn-check", (req, res) => {
  const s = req.query.input;
  StaticMaybeDangerous.run(true, s, res);
});

router.get("/static-boolean-controlled-passthrough-fp-check", (req, res) => {
  const s = req.query.input;
  StaticMaybeDangerous.run(false, s, res);
});

examples.push({
  heading: "Class with a Boolean-controlled passthrough in static methods",
  description: `
    Test with a class that has static sink/source/passthroughs, and
    where the passthrough is activated through a Boolean value passed to the
    constructor.
  `,
  handlers: [
    {
      heading: "False negative check",
      route: "/classes-es6/static-boolean-controlled-passthrough-fn-check",
      description: "The passthrough is activated.",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check",
      route: "/classes-es6/static-boolean-controlled-passthrough-fp-check",
      description: "The passthrough is disabled.",
      testCases: common.FP_TEST_CASE,
    },
  ],
});

module.exports = {
  router,
  categories: [
    {
      heading: "Classes (ES6)",
      description: `
      Test support of ES6 classes.
    `,
      examples,
    },
  ],
};
