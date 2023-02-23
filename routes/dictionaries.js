/** Examples related to arrays. */

const express = require("express");
const router = express.Router();
const secret = require("./secret");
const common = require("./common-examples");

const examples = [];

router.get("/beta-reduction-single-fixed-key", (req, res) => {
  const tainted = req.query.input;
  res.send("" + eval({ x: tainted }["x"]));
});

router.get("/beta-reduction-multiple-fixed-keys-projection", (req, res) => {
  const tainted = req.query.input;
  res.send("" + eval({ x: "ok", y: tainted, z: "ok" }["y"]));
});

examples.push({
  heading: "Beta Reduction for Object Literals",
  description: `
    If we treat <code>{ }</code> as a way to introduce objects, and 
    <code>[ ]</code> as eliminator of objects, then <code>{ x: y }['x'] === y</code>
    corresponds to beta-reduction.
  `,
  handlers: [
    {
      heading: "False negative check: access the tainted value",
      route: "/dictionaries/beta-reduction-single-fixed-key",
      description: "Single key: <code>{ x: y }['x'] === y</code>",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check: access the harmless value",
      route: "/dictionaries/beta-reduction-multiple-fixed-keys-projection",
      description: "Multiple keys",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
  ],
});

router.get("/beta-reduction-single-fixed-key-dot", (req, res) => {
  const tainted = req.query.input;
  res.send("" + eval({ x: tainted }["x"]));
});

router.get("/beta-reduction-multiple-fixed-keys-projection-dot", (req, res) => {
  const tainted = req.query.input;
  res.send("" + eval({ x: "ok", y: tainted, z: "ok" }["y"]));
});

examples.push({
  heading: "Beta reduction for object literals, dot-syntax for constant keys",
  description: `
    If we treat <code>{ p: ... }</code> as a way to introduce objects, and 
    <code>.p</code> as eliminator of objects, then <code>{ p: y }.p === y</code>
    corresponds to beta-reduction.
  `,
  handlers: [
    {
      heading: "False negative check: access the tainted value",
      route: "/dictionaries/beta-reduction-single-fixed-key-dot",
      description: "Single key: <code>{ x: tainted }.x</code> is tainted",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False negative check: multiple keys",
      route: "/dictionaries/beta-reduction-multiple-fixed-keys-projection-dot",
      description: "Multiple keys",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
  ],
});

router.get("/eta-expansion", (req, res) => {
  const tainted = req.query.input;
  const a = { x: "ok", y: tainted, z: "ok" };
  const b = { ...a };
  res.send("" + eval(b.y));
});

examples.push({
  heading: "Eta Expansion for Object Literals",
  description: `
    If we treat <code>{ }</code> as a way to introduce objects, and 
    <code>...</code> as eliminator of objects, then <code>{ ...x }</code>
    corresponds to eta-expansion of x.
  `,
  handlers: [
    {
      heading: "False negative check: access the tainted value",
      route: "/dictionaries/eta-expansion",
      description:
        "<code>{ ...x }</code> should have same tainted properties as <code>x</code>",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
  ],
});

router.get("/field-sensitivity-fixed-keys-fn-check", (req, res) => {
  const dict = {
    dangerous: req.query.input,
    notDangerous: 0,
  };

  res.send("" + eval(dict["dangerous"]));
});

router.get("/field-sensitivity-fixed-keys-fp-check", (req, res) => {
  var dict = {
    dangerous: req.query.input,
    notDangerous: "'harmless'",
  };

  res.send("" + eval(dict["notDangerous"]));
});

examples.push({
  heading: "Object literal with two fixed keys",
  description: `
    A dangerous value and a harmless value are stored in an object, and then
    accessed
  `,
  handlers: [
    {
      heading: "False negative check: access the tainted value",
      route: "/dictionaries/field-sensitivity-fixed-keys-fn-check",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check: access the harmless value",
      route: "/dictionaries/field-sensitivity-fixed-keys-fp-check",
      description: "",
      testCases: common.FP_TEST_CASE,
    },
  ],
});

router.get("/dynamic-keys-access-string-concat-fn-check", (req, res) => {
  const dangerous = "dangerous";
  const field = "field";

  const dangerousField = dangerous + field;

  var dict = {
    dangerousfield: req.query.input,
    notdangerousfield: 0,
  };

  res.send("" + eval(dict[dangerousField]));
});

router.get("/dynamic-keys-access-string-concat-fp-check", (req, res) => {
  const dangerous = "dangerous";
  const not = "not";
  const field = "field";

  const notDangerousField = not + dangerous + field;

  var dict = {
    dangerousfield: req.query.input,
    notdangerousfield: "'harmless'",
  };

  res.send("" + eval(dict[notDangerousField]));
});

examples.push({
  heading: "Dynamic key access: field name from string concatenation",
  description: `Accessing object properties at dynamically computed keys`,
  handlers: [
    {
      heading: "False negative check",
      route: "/dictionaries/dynamic-keys-access-string-concat-fn-check",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check",
      route: "/dictionaries/dynamic-keys-access-string-concat-fp-check",
      description: "",
      testCases: common.FP_TEST_CASE,
    },
  ],
});

module.exports = {
  router,
  categories: [
    {
      heading: "Dictionaries",
      description: `
        Heap-allocated associative arrays (<code>{ key: "value" }</code>)
      `,
      examples,
    },
  ],
};
