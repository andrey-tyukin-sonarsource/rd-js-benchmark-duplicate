const secret = require("./secret");

/**
 * Standard test cases where a tainted `req.query.input` is just fed into
 * `eval`.
 */
const TAINTED_TO_EVAL_TEST_CASES = [
  {
    description: "Harmless expressions should just be evaluated.",
    input: "2 * 3 * 7",
    expectedOutput: "42",
  },
  {
    description: `
      All other expressions are also evaluated,
      so that arbitrary side-effects on the server can be performed,
      and the "secret flag" from <code>require('secret')</code>
      can be "captured".
    `,
    input: "(reportIssue(), secret)",
    expectedOutput: secret,
  },
];

function fpTestCase(expectedOutput) {
  return [
    {
      description: `
      It shouldn't matter what we pass to the function, the output should
      be harmless.
    `,
      input: "(reportIssue(), secret)",
      expectedOutput: expectedOutput,
    },
  ];
}

/**
 * Standard test case which looks as if a tainted value might end up in an
 * eval, but where some other logic prevents this.
 *
 * This test is used to scan for false positives.
 */
const FP_TEST_CASE = fpTestCase("harmless");

module.exports = {
  TAINTED_TO_EVAL_TEST_CASES,
  FP_TEST_CASE,
  fpTestCase,
};
