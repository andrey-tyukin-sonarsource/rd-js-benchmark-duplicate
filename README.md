# What is Here?

This is a minimalistic application that can be used
as a benchmark for the support of core features of JS
by taint analyzers.

It is based on ExpressJS, and assumes that the taint
analyzer at least recognizes the `request.query`
property as a source.

# Required Tools

- `node`
- `npm`

# How to Install & Run

## Using the `run.sh` script on Unixoid OSes

Just run `./run.sh`, it will

- check that you have `node`, `npm` installed,
- download the dependencies,
- start the server locally at a random port (see console output)

Once the server has started, visit `http://localhost:insert-port-number-here/`
(there should be a clickable link in the console as well).

## Installing and Starting Manually

- run `npm install` to download the dependencies
- run `node main.js` to start the server
- visit `http://localhost:random-port-number/`

The port number is printed to the console, there should also be a clickable
link as well.

# Important Files

  * The `./main.js` file is the main entry point: it initializes the application,
registers multiple `router`s with the handlers that contain all the test
cases.
  * The file `./routes/landing-page.js` contains the code that renders the
    HTML served on the main page.
  * The JS that is executed on the client side is in `./public/script.js`
  * The actual handlers and test cases are contained in `./routes`
    (e.g. `arrays.js`, `variables.js` etc.)

# How to Add More Examples

First, select a fitting category for your example, and come up with a unique
identifier for it. The identifier should match `[a-z0-9-]+`. 
If there is no appropriate router for that, see "Creating a new Router"
below.

Then add the handlers for your example. Take some inspiration from the
already existing handlers, such as `/variables/source-directly-into-sink`
from `./routes/variables.js`:

```
router.get("/source-directly-into-sink", (req, res) => {
  res.send("Answer: " + eval(req.query.input));
});
```

The `req.query.input` is the tainted value, `eval` is the sink.

If you now restarted the server, you could send GET-requests 
directly to `/variables/source-directly-into-sink` in order to try out
what it's doing, but it's probably more convenient to use a UI in the
browser for that.

To add the examples (comments, forms, expected inputs and outputs) to the
main landing page, you have to modify a JSON-like data structure that
contains the descriptions of all the examples.

Here is what an example description looks like for the above handler
from `./variables.js`:

```
{
  heading: "Single local constant variable",
  description: `
    A tainted value is stored to a local <code>const tainted</code> variable,
    and then <code>tainted</code> is fed into a sink.
  `,
  handlers: [
    {
      description: `
        This handler will evaluate any input that it's given.
      `,
      route: "/variables/source-saved-to-tainted",
      testCases: [
        {
          description: "Harmless inputs are evaluated as expected.",
          input: "2 + 3",
          expectedOutput: "Answer: 5",
        },
        {
          description: `
            Maliciously manipulated inputs can lead to 
            unexpected and unpleasant side-effects on the server.
          `,
          input: '(console.log("All your base"), 42)',
          expectedOutput: "Answer: 42",
        },
      ],
    },
  ],
}
```

Since the `testCases` are often very similar for different examples,
feel free to reuse some commonly used test cases from 
`./routes/examples-common.js`, e.g.:

```
const common = require("./common-examples");
// [...]
examples.push({
  heading: "Single local constant variable",
  description: `
    A tainted value is stored to a local <code>const tainted</code> variable,
    and then <code>tainted</code> is fed into a sink.
  `,
  handlers: [
    {
      description: `
        This handler will evaluate any input that it's given.
      `,
      route: "/variables/source-saved-to-tainted",
      testCases: common.TAINTED_TO_EVAL_TEST_CASES,
    },
  ],
})
```
Upon start, the server will run some automatic checks to ensure that all
examples and routes are configured correctly. If something is wrong, it
will output (hopefully somewhat informative) error messages directly to
the console.


## Creating a new Router

If there is no appropriate category for your example, then invent a new
one, and take some inspiration e.g. from the `./routes/arrays.js` file
in order to create a new router. The most important steps for creating a
new router are:

  * Import Express: `const express = require('express')`
  * Create a new router: `const router = express.Router()`
  * Attach bunch of `get` handlers to the `router` (see e.g. `arrays.js`)
  * Override `module.exports` to an object with properties `router`
    (containing the router) and `categories`, containing a JSON-like
    description of the categories of examples (see below for details).
  * Import the router in `main.js`, add an `app.use("/moduleName", moduleName.router);`
    (let's follow the convention that the routes should be the same as the
     module names)
  * Add all example `categories` to the `exampleCategories` array

## Gotchas

 * Make sure that each handler ends with a `response.send(someString)`
 * Make sure that whatever you're sending is actually a string
   (strangely looking error messages about invalid response codes might
    appear otherwise)

# Before committing

Until a better process is put in place:

  * Run `npm run format` to format your code before committing
    (you can see what scripts are available by looking into
     `package.json -> scripts`)
  * Press the `Run All` button on the UI to check that all examples
    actually work correctly in the browser.

