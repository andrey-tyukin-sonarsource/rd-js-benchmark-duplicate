/** Examples related to arrays. */

const express = require("express");
const router = express.Router();
const secret = require("./secret");
const common = require("./common-examples");
const { reportIssue } = require("./issue-reporting");

const examples = [];

router.get("/identity-function-lambda-syntax", (req, res) => {
  const f = (x) => x;
  const tainted = f(req.query.input);

  res.send("" + eval(tainted));
});

examples.push({
  heading: "Identity function (lambda syntax)",
  description: `
    The function <code>I := x => x</code> should propagate tainted values.
  `,
  handlers: [
    {
      heading: "False negative check",
      route: "/lambdas/identity-function-lambda-syntax",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
  ],
});

router.get("/lambda-basic-fp-sanity-check", (req, res) => {
  const f = (x) => {
    const y = x;
    return "'harmless'";
  };
  const untainted = f(req.query.input);

  res.send("" + eval(untainted));
});

examples.push({
  heading: "Constantly harmless lambda",
  description: `
    Checks that a constant function does not return anything tainted
    simply because it gets a tainted argument.
  `,
  handlers: [
    {
      heading: "FP sanity check",
      route: "/lambdas/lambda-basic-fp-sanity-check",
      description: `The constant <code>'harmless'</code>
        function should not do anything dangerous.`,
      testCases: common.FP_TEST_CASE,
    },
  ],
});

router.get("/hof-taking-passthrough-fn-check", (req, res) => {
  const f = (x) => x;
  const s = req.query.input;

  function lambdaSink(res, f, s) {
    res.send("" + eval(f(s)));
  }

  lambdaSink(res, f, s);
});

router.get("/hof-taking-passthrough-fp-check", (req, res) => {
  const f = () => {
    return "'harmless'";
  };
  const s = req.query.input;

  function lambdaSink(res, f, s) {
    res.send("" + eval(f(s)));
  }

  lambdaSink(res, f, s);
});

examples.push({
  heading: "Higher order function taking a passthrough-lambda",
  description: `
    Checks whether <code>function hof(o, p, t) { o.sink(p(t)) }</code>
    propagates taint as expected.
  `,
  handlers: [
    {
      heading: "False negative check",
      route: "/lambdas/hof-taking-passthrough-fn-check",
      description: "<code>p</code> is identity function",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check",
      route: "/lambdas/hof-taking-passthrough-fp-check",
      description:
        "<code>p</code> is constant-<code>'harmless'</code> function",
      testCases: common.FP_TEST_CASE,
    },
  ],
});

const initializeCrockfordModule = (initialState) => {
  let internal = initialState;
  return {
    get: () => internal,
    set: (newState) => (internal = newState),
  };
};

router.get("/crockford-module-lambdas-with-let-fn-check", (req, res) => {
  const s = req.query.input;
  const dangerous = initializeCrockfordModule(s);

  res.send("" + eval(dangerous.get()));
});

router.get("/crockford-module-lambdas-with-let-fp-check", (req, res) => {
  const s = req.query.input;
  const notDangerous = initializeCrockfordModule(s);
  notDangerous.set("'harmless'");

  res.send("" + eval(notDangerous.get()));
});

router.get("/crockford-module-lambdas-with-let-use-setter", (req, res) => {
  const tainted = req.query.input;

  const modA = initializeCrockfordModule("'harmless'");
  modA.set(tainted);

  const modB = initializeCrockfordModule("'harmless'");
  eval(modB.get()); // OK

  res.send("" + eval(modA.get())); // BAD, CODE_EXEC
});

router.get(
  "/crockford-module-lambdas-with-let-multiple-instances",
  (req, res) => {
    const tainted = req.query.input;
    const modA = initializeCrockfordModule(tainted);
    const modB = initializeCrockfordModule("'harmless'");

    eval(modB.get()); // OK

    res.send("" + eval(modA.get())); // BAD, CODE_EXEC
  }
);

examples.push({
  heading: "Crockford Module Pattern (single <code>let</code>-cell, lambdas)",
  description: `
    Creates a little "module" with a single mutable cell, exposes a getter and
    a setter. Attempts to propagate tainted value through the cell.
  `,
  handlers: [
    {
      heading: "False negative check",
      route: "/lambdas/crockford-module-lambdas-with-let-fn-check",
      description: "Tainted value set during initialization",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check",
      route: "/lambdas/crockford-module-lambdas-with-let-fp-check",
      description:
        "Tainted value is overwritten by a harmless value using the setter",
      testCases: common.FP_TEST_CASE,
    },
    {
      heading: "Set to tainted",
      route: "/lambdas/crockford-module-lambdas-with-let-use-setter",
      description:
        "Harmless value is overwritten by a tainted value using the setter",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "Multiple instances",
      route: "/lambdas/crockford-module-lambdas-with-let-multiple-instances",
      description:
        "Create multiple instances of the module; Check that their state does not collide.",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
  ],
});

function factory() {
  var state = 0;
  return {
    getter() {
      return state;
    },
    setter(s) {
      state = s;
    },
  };
}

router.get("/crockford-module-method-syntax-variant-fn-check", (req, res) => {
  var inst = factory();
  inst.setter(req.query.input);
  res.send("" + eval(inst.getter()));
});

router.get(
  "/crockford-module-method-syntax-variant-fn-check-pt2",
  (req, res) => {
    var inst = factory();
    var inst2 = factory();
    inst.setter(req.query.input);
    inst2.setter("'harmless'");
    res.send("" + eval(inst.getter()));
  }
);

router.get("/crockford-module-method-syntax-variant-fp-check", (req, res) => {
  var inst = factory();
  inst.setter(req.query.input);
  inst.setter("'harmless'");
  res.send("" + eval(inst.getter()));
});

examples.push({
  heading: "Crockford-Module: alternative syntax (method-syntax)",
  description: `
    Same as above, but with <code>{ method() { ... }}</code>-syntax
  `,
  handlers: [
    {
      heading: "False negative check",
      route: "/lambdas/crockford-module-method-syntax-variant-fn-check",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False negative check: multiple module instances",
      route: "/lambdas/crockford-module-method-syntax-variant-fn-check-pt2",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check",
      route: "/lambdas/crockford-module-method-syntax-variant-fp-check",
      description: "The passthrough is disabled.",
      testCases: common.FP_TEST_CASE,
    },
  ],
});

const controller = (model) => {
  return {
    get: () => model.value,
    set: (v) => (model.value = v),
  };
};

router.get(
  "/mutable-model-state-referenced-by-two-controllers-fn",
  (req, res) => {
    // We have two controllers that reference the same underlying model
    const model = { value: "nothing interesting here" };
    const c1 = controller(model);
    const c2 = controller(model);

    // the model is updated through second controller `c2`
    c2.set(req.query.input);

    // the state of the model is accessed through the first controller
    res.send("" + eval(c1.get()));
  }
);

router.get(
  "/two-independent-models-referenced-by-two-controllers-fp",
  (req, res) => {
    const m1 = { value: '"harmless"' };
    const m2 = { value: "again, nothing here" };
    const c1 = controller(m1);
    const c2 = controller(m2);

    // the model `m2` is updated through second controller `c2`
    c2.set(req.query.input);

    // the model `m1` should be unaffected
    res.send("" + eval(c1.get()));
  }
);

examples.push({
  heading: "Mutable objects referenced from multiple Crockford-style modules",
  description: ``,
  handlers: [
    {
      heading: "False negative check",
      route: "/lambdas/mutable-model-state-referenced-by-two-controllers-fn",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check",
      route: "/lambdas/two-independent-models-referenced-by-two-controllers-fp",
      description: "",
      testCases: common.FP_TEST_CASE,
    },
  ],
});

router.get("/lambda-params-effects-fn", (req, res) => {
  function registerCallback(cb) {
    cb(req.query.input);
  }

  function myCallback(msg) {
    // Vulnerable
    res.send("" + eval(msg));
  }

  registerCallback(myCallback);
});

router.get("/lambda-params-effects-fp", (req, res) => {
  function registerCallback(cb) {
    cb(req.query.input);
  }

  function myCallback(msg) {
    // Non-vulnerable
    res.send("harmless");
  }

  registerCallback(myCallback);
});

examples.push({
  heading: "Effects of lambdas passed to HOF",
  description: ``,
  handlers: [
    {
      heading: "False negative check",
      route: "/lambdas/lambda-params-effects-fn",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check",
      route: "/lambdas/lambda-params-effects-fp",
      description: "",
      testCases: common.FP_TEST_CASE,
    },
  ],
});

router.get("/lambdas-in-closures-fn", (req, res) => {
  function f(x) {
    var snk = (x) => res.send("" + eval(x));
    function g(y) {
      // Vulnerable
      snk(y);
    }
    g(x);
  }

  f(req.query.input);
});
router.get("/lambdas-in-closures-fp", (req, res) => {
  function f(x) {
    // Non-vulnerable
    var snk = (x) => res.send("" + eval(x));
    function g(y) {
      snk(y);
    }
    g('"harmless"');
  }

  f(req.query.input);
});

examples.push({
  heading: "Lambdas in closures",
  description: `Closures end up as values in other closures: does it still work?`,
  handlers: [
    {
      heading: "False negative check",
      route: "/lambdas/lambdas-in-closures-fn",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check",
      route: "/lambdas/lambdas-in-closures-fp",
      description: "",
      testCases: common.FP_TEST_CASE,
    },
  ],
});

function etaExpandSink(snk) {
  var s = snk;
  function n(t) {
    s(t);
  }
  return n;
}

router.get("/eta-expanding-sink-fn", (req, res) => {
  // Vulnerable
  var c = etaExpandSink((x) => res.send("" + eval(x)));
  c(req.query.input);
});

router.get("/dirac-delta-at-harmless", (req, res) => {
  // Evaluates given function at 'harmless'
  function diracDeltaHarmless(snk) {
    var s = snk;
    function n(t) {
      s('"harmless"');
    }
    return n;
  }
  // Non-vulnerable
  var c = diracDeltaHarmless((x) => res.send("" + eval(x)));
  c(req.query.input);
});

examples.push({
  heading: "Eta-expanding side-effectful lambdas passed to HOF",
  description: ``,
  handlers: [
    {
      heading: "False negative check: eta-expanding a sink",
      route: "/lambdas/eta-expanding-sink-fn",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check: applying Dirac Delta['harmless'] to sink",
      route: "/lambdas/dirac-delta-at-harmless",
      description: `
        (See <a href="https://en.wikipedia.org/wiki/Dirac_delta_function">δ₀</a>)
        <code>δ₀(f) := f(0)</code>,
        analogously <code>diracDelta_harmless(f) := f("harmless")</code>,
        hence the name.
      `,
      testCases: common.FP_TEST_CASE,
    },
  ],
});

router.get("/closing-over-property-of-param-fn", (req, res) => {
  function c(objSnk) {
    var s = objSnk.snk;
    return function (t) {
      s(t);
    };
  }

  // Vulnerable
  var f = c({
    snk: function (x) {
      res.send("" + eval(x));
    },
  });
  f(req.query.input);
});

router.get("/closing-over-property-of-param-fp", (req, res) => {
  function c(objSnk) {
    var s = objSnk.snk;
    return function (t) {
      s('"harmless"');
    };
  }

  // Non-vulnerable
  var f = c({
    snk: function (x) {
      res.send("" + eval(x));
    },
  });
  f(req.query.input);
});

examples.push({
  heading: "Closing over properties of parameters",
  description: ``,
  handlers: [
    {
      heading: "False negative check",
      route: "/lambdas/closing-over-property-of-param-fn",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check",
      route: "/lambdas/closing-over-property-of-param-fp",
      description: ``,
      testCases: common.FP_TEST_CASE,
    },
  ],
});

module.exports = {
  router,
  categories: [
    {
      heading: "Lambdas",
      description: `
      Testing support for lambda expressions (<code>(x, y, z) => functionBody</code>).
    `,
      examples,
    },
  ],
};
