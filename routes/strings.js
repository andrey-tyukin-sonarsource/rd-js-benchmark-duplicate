/** Examples related to if-else control flow construct. */

const express = require("express");
const { reportIssue } = require("./issue-reporting");
const router = express.Router();

const examples = [];

/**
 * The `.substring(0,0)` always returns an empty string,
 *
 * which is not tainted.
 */
router.get("/substring-0-0", (req, res) => {
  let tainted = req.query.input;
  let s = tainted.substring(0, 0);
  res.send("Answer: " + eval(s));
});

examples.push({
  heading: "Zero-length substrings",
  description: `
    Test whether the analyzer recognizes 
    that zero-length substrings are empty and therefore harmless.
  `,
  handlers: [
    {
      heading: "Substring from 0 to 0",
      description: `
        This handler is not vulnerable,
        the input is always converted into an empty string.
        This example is interesting from the point of view of false positives.
      `,
      route: "/strings/substring-0-0",
      testCases: [
        {
          description: "The input is ignored, so it doesn't really matter.",
          input: "someVeryDangerouslyLookingString",
          expectedOutput: "Answer: undefined",
        },
      ],
    },
  ],
});

module.exports = {
  router,
  categories: [
    {
      heading: "Strings",
      description: "Basic operations on strings",
      examples,
    },
  ],
};
