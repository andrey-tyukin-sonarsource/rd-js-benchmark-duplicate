/** Examples related to integers. */

const express = require("express");
const router = express.Router();
const secret = require("./secret");
const common = require("./common-examples");
const examples = [];

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

router.get("/max-a-b-always-greater-than-a", (req, res) => {
  const a = getRandomInt(10);
  const b = getRandomInt(10);

  var max = a;
  if (b >= max) {
    max = b;
  }

  var tainted = "";
  if (max >= a) {
    // always true
    tainted = req.query.input;
  }

  res.send("" + eval(tainted));
});

router.get("/max-a-b-never-less-than-a", (req, res) => {
  const a = getRandomInt(10);
  const b = getRandomInt(10);

  var max = a;
  if (b >= max) {
    max = b;
  }

  var untainted = "'harmless'";
  if (a > max) {
    // always false
    untainted = req.query.input;
  }

  res.send("" + eval(untainted));
});

examples.push({
  heading: `
    Max: Comparisons between <code>a</code>, <code>b</code> and <code>max(a, b)</code>
  `,
  description: `
    Check whether the analyzer can figure out that <code>max(a, b)</code>
    (computed through explicit <code>if-else</code>) is always greater or 
    equal than <code>a</code>.
  `,
  handlers: [
    {
      heading:
        "Maximum of two integers is always greater than the first integer",
      route: "/integers/max-a-b-always-greater-than-a",
      description: `<code>max(a, b) &gt;= a</code> is always true`,
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "Maximum of two integers is never less than the first integer",
      route: "/integers/max-a-b-never-less-than-a",
      description: `<code>max(a, b) < a</code> is always false`,
      testCases: common.FP_TEST_CASE,
    },
  ],
});

module.exports = {
  router,
  categories: [
    {
      heading: "Integers",
      description: `Testing support of integers`,
      examples,
    },
  ],
};
