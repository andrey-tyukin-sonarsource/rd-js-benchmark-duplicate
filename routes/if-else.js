/** Examples related to if-else control flow construct. */

const express = require("express");
const router = express.Router();

const examples = [];

router.get("/if-true", (req, res) => {
  let tainted = req.query.input;

  if (true) {
    tainted = "";
  }

  // This will never do anything, `tainted` is always empty
  res.send("Answer: " + eval(tainted));
});

examples.push({
  heading: "If-True",
  description:
    "Test whether the analyzer can cope with do-nothing <code>if(true)</code> conditions.",
  handlers: [
    {
      heading: "<code>if(true){...}</code> should be recognized and ignored",
      description: `
        This handler is not actually vulnerable, the evil <code>eval</code> should
        always return <code>undefined</code>
      `,
      route: "/if-else/if-true",
      testCases: [
        {
          description: "the input is ignored, so it doesn't really matter",
          input: "42",
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
      heading: "Control-Flow: If-Else",
      description: `
        Support for basic conditionals
        (<code>if</code>-<code>else</code>),
        without the ternary operator.
      `,
      examples,
    },
  ],
};
