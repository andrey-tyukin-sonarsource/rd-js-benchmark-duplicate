/** Examples related to arrays. */

const express = require("express");
const router = express.Router();
const secret = require("./secret");
const common = require("./common-examples");
const { reportIssue } = require("./issue-reporting");

const examples = [];

router.get(`/single-element-array`, (req, res) => {
  const a = [req.query.input];
  res.type("txt");
  res.setHeader("content-type", "text/plain");
  res.set("Content-Type", "text/plain");
  res.send(`${eval(a[0])}`);
});

examples.push({
  heading: "Single element array",
  description: `
    Puts a tainted value into a one-element array,
    then extracts it, and passes it into the sink.
  `,
  handlers: [
    {
      heading:
        "<code>[x][0]</code> should propagate the tainted <code>t</code>",
      route: "/arrays/single-element-array",
      description: "",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
  ],
});

router.get("/array-filled-with-for-loop-false-negative-check", (req, res) => {
  const a = [];
  for (let i = 0; i < 10; i++) {
    a.push(i);
  }

  a[42] = req.query.input;

  res.send("" + eval(a[42]));
});

router.get("/array-filled-with-for-loop-false-positive-check", (req, res) => {
  const a = [];
  //  `var i` intentionally left as-is
  for (var i = 0; i < 10; i++) {
    a.push(i);
  }

  a[42] = req.query.input;

  res.send("" + eval(a[7]));
});

examples.push({
  heading: "Array with multiple elements, filled in a <code>for</code>-loop",
  description: `
    An array is filled with multiple harmless elements by a <code>for</code>-loop,
    then one additional element is tainted, and one element is fed into
    a sink.

    The examples are supposed to test how accurately array indices
    are modeled.
  `,
  handlers: [
    {
      heading: "False negative check",
      route: "/arrays/array-filled-with-for-loop-false-negative-check",
      description: "<code>a[42] = tainted; eval(a[42])</code>",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check",
      route: "/arrays/array-filled-with-for-loop-false-positive-check",
      description: "<code>a[42] = tainted; eval(a[7])</code>",
      testCases: [
        {
          input: "'ignored''",
          expectedOutput: "7",
          description:
            "The tainted value is put into the array, but never read.",
        },
      ],
    },
  ],
});

router.get("/conditional-push-var-idx-fn-check", (req, res) => {
  const a = [];
  for (let i = 0; i < 10; i++) {
    a.push(i);
    if (i == 7) {
      a[i] = req.query.input;
    }
  }

  res.send("" + eval(a[7]));
});

router.get("/conditional-push-var-idx-fp-check", (req, res) => {
  const a = [];
  for (let i = 0; i < 10; i++) {
    a.push(i);
    if (i == 7) {
      a[i] = req.query.input;
    }
  }

  res.send("" + eval(a[8]));
});

examples.push({
  heading: "Conditionally push tainted value into array",
  description: `
    An array is filled with multiple harmless elements and one tainted element.
    Then an element of the array is extracted and put into a sink.
  `,
  handlers: [
    {
      heading: "False negative check",
      route: "/arrays/conditional-push-var-idx-fn-check",
      description: "Push tainted at index N, then <code>eval(a[N])</code>.",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
    {
      heading: "False positive check",
      route: "/arrays/conditional-push-var-idx-fp-check",
      description:
        "Push tainted at index N, then <code>eval(a[M])</code> for M != N.",
      testCases: [
        {
          input: "'ignored'",
          expectedOutput: "8",
          description:
            "The tainted value is put into the array, but never read.",
        },
      ],
    },
  ],
});

module.exports = {
  router,
  categories: [
    {
      heading: "Arrays",
      description: `
      Testing basic array support
      (creating arrays, setting, accessing, iterating etc.).
    `,
      examples,
    },
  ],
};
