// This is some boilerplate for setting up an Express app
const express = require("express");
const app = express();
app.use(express.static("public"));

const arrays = require("./routes/arrays");
const classesEs6 = require("./routes/classes-es6");
const dictionaries = require("./routes/dictionaries");
const exceptions = require("./routes/exceptions");
const ifElse = require("./routes/if-else");
const integers = require("./routes/integers");
const interproc = require("./routes/interproc");
const lambdas = require("./routes/lambdas");
const newKeyword = require("./routes/new-keyword");
const prototypes = require("./routes/prototypes");
const scopes = require("./routes/scopes");
const strings = require("./routes/strings");
const thisisfine = require("./routes/thisisfine");
const variables = require("./routes/variables");

const landingPage = require("./routes/landing-page");
const { validateCategories } = require("./routes/validate-schema");
const validateRoutes = require("./routes/validate-routes");
const { findDuplicateHeadings } = require("./routes/validate-headings");

// Compose the routes with all the examples into one big application
app.use("/arrays", arrays.router);
app.use("/classes-es6", classesEs6.router);
app.use("/dictionaries", dictionaries.router);
app.use("/exceptions", exceptions.router);
app.use("/if-else", ifElse.router);
app.use("/integers", integers.router);
app.use("/interproc", interproc.router);
app.use("/lambdas", lambdas.router);
app.use("/new-keyword", newKeyword.router);
app.use("/prototypes", prototypes.router);
app.use("/scopes", scopes.router);
app.use("/strings", strings.router);
app.use("/thisisfine", thisisfine.router);
app.use("/variables", variables.router);

// Collect all the examples for the landing page
const exampleCategories = [
  ...arrays.categories,
  ...classesEs6.categories,
  ...dictionaries.categories,
  ...exceptions.categories,
  ...ifElse.categories,
  ...integers.categories,
  ...interproc.categories,
  ...lambdas.categories,
  ...newKeyword.categories,
  ...prototypes.categories,
  ...scopes.categories,
  ...strings.categories,
  ...thisisfine.categories,
  ...variables.categories,
];

// Redirect `/` to `/index`
app.get("/", function (req, res) {
  res.redirect("/index");
});

// Run some basic sanity checks before starting the server
if (!validateCategories(exampleCategories)) {
  console.error("[ERROR] Schema validation failed. Exit.");
  process.exit(1);
}

if (!validateRoutes(exampleCategories, app)) {
  console.error("[ERROR] Invalid routes configuration. Exit.");
  process.exit(2);
}

const duplicateHeadings = findDuplicateHeadings(exampleCategories);
if (duplicateHeadings.length !== 0) {
  console.error(
    `[ERROR] There were duplicate headings:\n${duplicateHeadings.join(
      "\n"
    )}\nExit.`
  );
  process.exit(3);
}

// Render the landing page with all examples on `/index`
app.get("/index", landingPage(exampleCategories));

// This starts the server
const autoShutdownDelay = 180000;
const server = app.listen(0, () => {
  const port = server.address().port;
  console.log(`[info] Example app listening on port ${port}`);
  console.log(`[info] You can access it at 'http://localhost:${port}/'.`);
  console.log(
    "[info] Press CTRL+C to stop the server (restart with `node main.js`)"
  );
  console.log("[info] Note that this vulnerable server will");
  console.log("       shut down automatically after 3 minutes just to make");
  console.log("       sure that you don't leave it running in the background.");
  setTimeout(() => {
    server.close(() => {
      console.log("[INFO] Server shut down automatically.");
    });
  }, autoShutdownDelay);
});
