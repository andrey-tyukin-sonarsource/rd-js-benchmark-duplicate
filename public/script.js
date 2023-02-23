console.log("index.js loaded");

// CSS-classes for various outcomes
const CLASS_ERROR = "error";
const CLASS_SUCCESS = "success";
const CLASS_UNEXPECTED = "unexpected";

// Collections for successful / failed runs
let successfulRuns = new Set();
let failedRuns = new Set();

// This is a handler that is attached to every testCase-form
function submitTestCase(formId, inputId, expectedOutputId, actualOutputId) {
  console.log(
    `Invoking submitTestCase(event, ${formId}, ${inputId}, ${expectedOutputId}, ${actualOutputId})`
  );

  const expectedElement = document.getElementById(expectedOutputId);
  const outputElement = document.getElementById(actualOutputId);
  const form = document.getElementById(formId);

  const params = new URLSearchParams(new FormData(form)).toString();
  const request = `${form.action}?${params}`;
  const headers = new Headers({
    Accept: "text/plain",
  });

  fetch(request, {
    method: "GET",
    headers,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Response was not OK (status = ${response.status})`);
      }
      return response.text();
    })
    .then((data) => {
      if (data === expectedElement.value) {
        setOutputClass(outputElement, CLASS_SUCCESS);
        successfulRuns.add(formId);
        failedRuns.delete(formId);
      } else {
        setOutputClass(outputElement, CLASS_UNEXPECTED);
        successfulRuns.delete(formId);
        failedRuns.add(formId);
      }
      outputElement.textContent = data;
      updateSummary();
    })
    .catch((error) => {
      setOutputClass(outputElement, CLASS_ERROR);
      outputElement.textContent = `${error}`;
      failedRuns.add(formId);
      successfulRuns.delete(formId);
      updateSummary();
    });
}

function setOutputClass(outputElement, cls) {
  outputElement.classList.remove(CLASS_ERROR);
  outputElement.classList.remove(CLASS_UNEXPECTED);
  outputElement.classList.remove(CLASS_SUCCESS);
  outputElement.classList.add(cls);
}

function submitForms(formIds) {
  unsuccessfulRuns = new Set();
  failedRuns = new Set();
  for (let id of formIds) {
    console.log("submitting request for " + id);
    document.getElementById(id).requestSubmit();
  }
}

function updateSummary() {
  console.log("Updating summary");
  console.log(successfulRuns, failedRuns);
  const numSuccessfulRuns = document.getElementById("numSuccessfulRuns");
  const numFailedRuns = document.getElementById("numFailedRuns");
  const listFailedRuns = document.getElementById("listFailedRuns");

  numSuccessfulRuns.innerHTML = `${successfulRuns.size}`;
  numFailedRuns.innerHTML = `${failedRuns.size}`;
  listFailedRuns.innerHTML = Array.from(failedRuns)
    .sort()
    .map((i) => `<li><a href="#${i}">${i}</a></li>`)
    .join("\n");
}
