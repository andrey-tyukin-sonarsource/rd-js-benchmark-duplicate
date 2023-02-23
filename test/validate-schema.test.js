const {
  validateCategories,
  validateWithSchema,
  TestCaseSchema,
  HandlerSchema,
  ExampleSchema,
  CategorySchema,
} = require("../routes/validate-schema");
const Validator = require("jsonschema").Validator;

const GoodTestCase = {
  description: "check",
  input: "2 + 2",
  expectedOutput: "4",
};

const GoodHandler = {
  heading: "handler heading",
  description: "good handler description",
  route: "/some/route",
  testCases: [GoodTestCase],
};

const GoodExample = {
  heading: "example 123",
  description: "ex descr",
  handlers: [GoodHandler, GoodHandler],
};

const GoodCategory = {
  heading: "Arrays",
  description: "something about arrays",
  examples: [GoodExample, GoodExample],
};

test("valid testCase should be accepted", () => {
  const res = validateWithSchema(GoodTestCase, TestCaseSchema);
  expect(res.valid).toBeTruthy();
});

test("invalid testCase should be rejected: missing value", () => {
  const t = {
    input: "2 + 2",
    expectedOutput: "4",
  };
  const res = validateWithSchema(t, TestCaseSchema);
  expect(res.errors[0].message).toContain("description");
  expect(res.valid).toBeFalsy();
});

test("invalid testCase should be rejected: typo in value name", () => {
  const t = {
    description: "",
    input: "2 + 2",
    expectedoutput: "4",
  };
  const res = validateWithSchema(t, TestCaseSchema);
  expect(res.errors[0].message).toContain("expectedOutput");
  expect(res.valid).toBeFalsy();
});

test("invalid testCase should be rejected: wrong type", () => {
  const t = {
    description: { nope: 42 },
    input: "2 + 2",
    expectedOutput: "4",
  };
  const res = validateWithSchema(t, TestCaseSchema);
  expect(res.errors[0].message).toContain("string");
  expect(res.valid).toBeFalsy();
});

test("valid handler should be accepted", () => {
  const res = validateWithSchema(GoodHandler, HandlerSchema);
  expect(res.valid).toBeTruthy();
});

test("invalid handler: forgotten route", () => {
  const h = { ...GoodHandler };
  delete h.route;
  const res = validateWithSchema(h, HandlerSchema);
  expect(res.valid).toBeFalsy();
  expect(res.errors[0].message).toContain("route");
});

test("valid example", () => {
  const res = validateWithSchema(GoodExample, ExampleSchema);
  expect(res.valid).toBeTruthy();
});

test("invalid example", () => {
  const e = { ...GoodExample };
  delete e.description;
  delete e.handlers;
  const res = validateWithSchema(e, ExampleSchema);
  expect(res.valid).toBeFalsy();
});

test("valid category", () => {
  const res = validateWithSchema(GoodCategory, CategorySchema);
  expect(res.valid).toBeTruthy();
});

const CorruptedCategory = (() => {
  const c = { ...GoodCategory };
  const e = { ...GoodExample };
  delete e.description;
  c.examples = [GoodExample, e];
  return c;
})();

test("invalid category", () => {
  const res = validateWithSchema(CorruptedCategory, CategorySchema);
  expect(res.valid).toBeFalsy();
});

test("validateCategories should accept valid categories", () => {
  expect(validateCategories([GoodCategory, GoodCategory])).toEqual(true);
});

test("validateCategories should reject invalid categories", () => {
  const stderr = console.error;
  console.error = function () {};
  expect(
    validateCategories([GoodCategory, CorruptedCategory, GoodCategory])
  ).toEqual(false);
  console.error = stderr;
});
