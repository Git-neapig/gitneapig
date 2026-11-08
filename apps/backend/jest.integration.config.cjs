// Jest loads its configuration in CommonJS before transforming test modules.
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config({ path: "../../.env", quiet: true });
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/test/**/*.integration.ts"],
  testTimeout: 30000,
  clearMocks: true,
};
