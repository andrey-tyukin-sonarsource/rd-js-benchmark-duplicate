// This configures the handler that generates the actual HTML.
//
// We simply return a plain HTML string, we do not
// use any templating engines for now.

/**
 * Takes a list of categories, renders the whole HTML page.
 *
 * Here, by "category", we mean just a list of
 * examples that share some common theme.
 *
 * A category contains:
 *  - `heading`: (html-formatted text)
 *               heading for a section with multiple examples
 *               (Arrays, Block Scope etc.)
 *  - `description`: (html-formatted text)
 *                   A description that applies to all examples in this category
 *  - `examples`: list of examples
 *
 * Every example corresponds to one or more handlers on the server side.
 * The handlers should be closely related, but we still allow multiple handlers,
 * so that one can, for example, demonstrate multiple false positives / false
 * negatives cases for essentially the same setup.
 *
 * An example consists of:
 *  - `heading`: (html-formatted text) - a heading that describes the example
 *  - `description`: (html-formatted text) - a description
 *  - `handlers`: (list of handlers)
 *
 * A "handler" is essentially a list of test cases sent to the same handler.
 *
 * A handler consists of:
 *  - `heading`: (html-formatted string)
 *  - `description`: (html-formatted string)
 *  - `route`: (string) full route to a handler registered on the server-side
 *  - `testCases`: list of test cases (input / output pairs sent to the same handler)
 *
 * A test case is an input-output pair with a brief description. It consists of:
 *  - `description`: (html-formatted string)
 *  - `input`: (JS expression that is sent as `input` e.g. `2+2` or `SECRET_FLAG`)
 *  - `output`: (plain text expected as result returned by the server)
 *
 * See also `validate-schema.js` for the schemas that enforce the
 * correct structure of the examples.
 */
function renderLandingPage(categories) {
  return `
    <!doctype html>
    <html lang="en">
    <head>
      ${renderHeadContent()}
    </head>
    <body>
      <div class="page">
      <h1>JS Core Language Features Benchmark</h1>
      ${renderDisclaimer()}
      <br>
      ${renderRunAll(categories)}
      <br>
      ${renderUploadSarif()}
      <br>
      ${renderCategories(categories)}
      </div>
    </body>
  `;
}

function renderHeadContent() {
  return `
    <meta charset=utf-8>
    <script src="script.js"></script>
    <link rel="stylesheet" href="style.css">
  `;
}

function renderCategories(categories) {
  return categories.map(renderCategory).join("\n\n\n<br>\n\n\n");
}

function renderCategory(category) {
  return `
    <div class="category">
      <h2 class="tooltip">${category.heading}
        <span class="tooltiptext">category heading</span>
      </h2>
      <br>
      <p class="tooltip">
        ${category.description}
        <span class="tooltiptext">category description</span>
      </p>
      ${category.examples.map(renderExample).join("\n\n<br>\n\n")}
    </div>
  `;
}

function renderExample(example) {
  return `
    <div class="example">
      <h3 class="tooltip">${example.heading}
        <span class="tooltiptext">example heading</span>
      </h3>
      <p class="tooltip">${example.description}
        <span class="tooltiptext">example description</span>
      </p>
      ${example.handlers.map(renderHandler).join("\n\n")}
    </div>
  `;
}

function renderHandler(handler) {
  const joinedTestCases = handler.testCases
    .map((tc, idx) => renderTestCase(tc, handler.route, idx))
    .join("\n\n");
  return `
    <div class="handler">
      <h5 class="tooltip">${handler.heading}
        <span class="tooltiptext">handler heading</span>
      </h5>
      <p class="tooltip">
        <code class="route">${handler.route}</code>
        <span class="tooltiptext">handler route</span>
      </p>
      <p class="tooltip">${handler.description}
        <span class="tooltiptext">handler description</span>
      </p>
      ${joinedTestCases}
    </div>
  `;
}

function renderTestCase(testCase, route, index) {
  const inputId = createId("input", route, index);
  const expectedOutputId = createId("expectedOutput", route, index);
  const outputId = createId("output", route, index);
  const formId = createId("form", route, index);
  const inputWithoutDoubleQuotes = testCase.input.replace(/"/g, "&quot;");
  return `
    <div class="testcase">
      <p class="tooltip">${testCase.description}
        <span class="tooltiptext">test-case description</span>
      </p>
      <form
        action="${route}"
        onsubmit="event.preventDefault(); submitTestCase('${formId}', '${inputId}', '${expectedOutputId}', '${outputId}');"
        id="${formId}"
      >
        <fieldset>
        <p>
          <label for="${inputId}">Input:</label>
          <input
            type="text" 
            id="${inputId}" 
            name="input" 
            value="${inputWithoutDoubleQuotes}"
            class="labeled"
          >
        </p>
        <p>
          <label for="${expectedOutputId}">Expected output:</label>
          <input
            type="text"
            id="${expectedOutputId}"
            name="expected-output"
            value="${testCase.expectedOutput}"
            class="labeled"
            disabled
          >
        </p>
        </fieldset>
        <br>
        <input type="submit" value="Run">
      </form>
      <div class="response">
        <pre><code id="${outputId}"></code></pre>
      </div>
    </div>
  `;
}

/** Helper function for creating unique `id`s for certain crucial HTML dom elements. */
function createId(prefix, route, index) {
  const routeWithDashes = route.replace(/[^a-z0-9]/g, "-");
  return `${prefix}${routeWithDashes}-${index}`;
}

/** A single button that submits all forms and runs all tests at once. */
function renderRunAll(categories) {
  const allFormIds = collectAllFormIds(categories);
  const allFormIdsAsArgs = allFormIds.map((s) => `'${s}'`).join(", ");
  return `
    <div class="category">
      <h2>Run All</h2>
      <p>To run all examples at once, press this button:</p>
      <form
        onsubmit="event.preventDefault(); submitForms([${allFormIdsAsArgs}]);"
      >
        <input type="submit" value="Run All">
      </form>
      <br>
      <div>
        Successful runs: <span id="numSuccessfulRuns">0</span>
        <br>
        Failed runs: <span id="numFailedRuns">0</span>
      </div>
      <div class="response">
        <ol id="listFailedRuns"></ol>
      </div>
    </div>
  `;
}

function collectAllFormIds(categories) {
  const res = [];
  for (let c of categories) {
    for (let e of c.examples) {
      for (let h of e.handlers) {
        for (let i = 0; i < h.testCases.length; i++) {
          const tc = h.testCases[i];
          const formId = createId("form", h.route, i);
          res.push(formId);
        }
      }
    }
  }
  return res;
}

function renderDisclaimer() {
  return `<div class="warning">
    This is a deliberately vulnerable application that has been created
    specifically for the purpose of benchmarking static analysis tools.

    <ul>
      <li>Don't attempt to run it in any environment where it is accessible to
          non-trusted users.
      </li>
      <li>Don't run it locally in the background while browsing through
          suspicious webpages or clicking on suspicious links</li>
      <li>This server will shut down automatically after a few minutes.</li>
      <li class="relativize">
          Other than that: it's not any more dangerous than any other
          sketch of a webapp that you're running while working through an
          average ExpressJS tutorial. Just apply good judgement.
      </li>
    </ul>
  </div>`;
}

/**
 * A form that allows to upload SARIF (as JSON) to compare the results with
 * the ground truth.
 */
function renderUploadSarif() {
  return `
    <div class="category">
      <h2>Compare with SARIF</h2>
      <p>
        To compare the outcomes of "Run All" (this is the ground truth) 
        with a SARIF produced by some analysis tool, copy-paste the SARIF
        (as JSON) to the below field, and click on "Compare SARIF to ground truth"
      </p>
      <p>(The result is returned as JSON; Clicking on the button will leave
        the current page)</p>
      <form action="/issue-reporting/compare-sarif" method="POST">
        <textarea name="sarif" cols="120" rows="5"></textarea>
        <input type="submit" value="Compare SARIF to ground truth">
      </form>
    </div>
  `;
}

module.exports = function (exampleSections) {
  return function (req, res) {
    res.set("Content-Type", "text/html");
    res.send(Buffer.from(renderLandingPage(exampleSections)));
  };
};
