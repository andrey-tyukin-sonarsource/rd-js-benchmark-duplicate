/** Issue reporting for determining ground-truth */

const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

// A "location" is just a string in format `path/relative/to/root/file.js:42`

/** Set of all issue locations ever reported */
//  (global, mutable, yes...)
const reportedIssues = new Set();

/**
 * Reports an issue with current location. Prints an info message to stdout.
 */
// From here: https://stackoverflow.com/a/47105238/2707792
function reportIssue() {
  const e = new Error();
  const regex = /\(.*\/(routes\/[a-z0-9-]+\.js):(\d+):(?:\d+)\)/;
  const match = regex.exec(e.stack.split("\n")[2]);
  const path = match[1];
  const line = match[2];
  const location = `${path}:${line}`;
  console.log(`[INFO] Reporting issue at ${location}`);
  reportedIssues.add(location);
  return location;
}

/** Extracts list of issue locations from a JSON-serialized SARIF.*/
function extractIssuesFromSarif(sarifJson) {
  const arr = JSON.parse(sarifJson);
  return arr
    .map((e) => {
      const loc = e.most_recent_instance.location;
      // Note: SARIF's lines are 0-based
      return `${loc.path}:${loc.start_line + 1}`;
    })
    .filter((loc) => !loc.includes("issue-reporting"));
}

function compareResults(groundTruthIssuesSet, sarifIssuesArr) {
  const tp = [];
  const fp = [];

  for (let i of sarifIssuesArr) {
    if (groundTruthIssuesSet.has(i)) {
      tp.push(i);
    } else {
      fp.push(i);
    }
  }

  const fn = [];
  const sarifSet = new Set(sarifIssuesArr);
  for (let i of groundTruthIssuesSet) {
    if (!sarifSet.has(i)) {
      fn.push(i);
    }
  }
  tp.sort();
  fp.sort();
  fp.sort();
  return {
    groundTruth: Array.from(groundTruthIssuesSet),
    sarif: sarifIssuesArr.sort(),
    numTp: tp.length,
    numFp: fp.length,
    numFn: fn.length,
    tp,
    fp,
    fn,
  };
}

router.use(bodyParser.urlencoded({ extended: false }));
router.post("/compare-sarif", (req, res) => {
  console.log("Received: ");
  console.log(req.body.sarif);
  const sarifIssues = extractIssuesFromSarif(req.body.sarif);
  const comparison = compareResults(reportedIssues, sarifIssues);
  res.json(comparison);
});

module.exports = {
  reportIssue,
  reportedIssues,
  router,
};
