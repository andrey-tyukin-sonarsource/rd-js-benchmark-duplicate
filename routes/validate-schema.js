const Validator = require("jsonschema").Validator;

const CategorySchema = {
  id: "/Category",
  type: "object",
  properties: {
    heading: { type: "string" },
    description: { type: "string" },
    examples: {
      type: "array",
      items: { $ref: "/Example" },
    },
  },
  required: ["heading", "description", "examples"],
};

const ExampleSchema = {
  id: "/Example",
  type: "object",
  properties: {
    heading: { type: "string" },
    description: { type: "string" },
    handlers: {
      type: "array",
      items: { $ref: "/Handler" },
    },
  },
  required: ["heading", "description", "handlers"],
};

const HandlerSchema = {
  id: "/Handler",
  type: "object",
  properties: {
    description: { type: "string" },
    route: { type: "string" },
    testCases: {
      type: "array",
      items: { $ref: "/TestCase" },
    },
  },
  required: ["description", "route", "testCases"],
};

const TestCaseSchema = {
  id: "/TestCase",
  type: "object",
  properties: {
    description: { type: "string" },
    input: { type: "string" },
    expectedOutput: { type: "string" },
  },
  required: ["description", "input", "expectedOutput"],
};

/** Sets up the validator, registers all schemata, runs the validation. */
function validateWithSchema(value, schema) {
  const v = new Validator();
  v.addSchema(CategorySchema, "/Category");
  v.addSchema(ExampleSchema, "/Example");
  v.addSchema(HandlerSchema, "/Handler");
  v.addSchema(TestCaseSchema, "/TestCase");
  return v.validate(value, schema, { required: true });
}

/**
 * Validates the schema for all example categories,
 * prints error messages directly to stderr.
 *
 * Returns `true` if validation is successful, `false` otherwise.
 */
function validateCategories(exampleCategories) {
  let successful = true;
  for (let i = 0; i < exampleCategories.length; i++) {
    const category = exampleCategories[i];
    const result = validateWithSchema(category, CategorySchema);
    if (!result.valid) {
      console.error(
        `[ERROR] Schema validation failed for example category at index ` +
          `${i} (${(category && category.heading) || "no heading"}):\n${result}`
      );
      successful = false;
    }
  }
  return successful;
}

// Exporting all schemas for tests
module.exports = {
  CategorySchema,
  ExampleSchema,
  HandlerSchema,
  TestCaseSchema,
  validateWithSchema,
  validateCategories,
};
