import { parseConfiguration } from "./config";
const valid = {
  DATABASE_URL: "postgresql://localhost/gitneapig_test",
  JWT_SECRET: "a".repeat(32),
  API_KEY_HMAC_SECRET: "b".repeat(32),
};
describe("configuration", () => {
  it("uses fixed session and timezone defaults", () => {
    expect(parseConfiguration(valid)).toMatchObject({
      JWT_EXPIRES_IN: "8h",
      APP_TIME_ZONE: "Asia/Seoul",
    });
  });
  it("requires HTTPS for production", () =>
    expect(() =>
      parseConfiguration({ ...valid, NODE_ENV: "production" }),
    ).toThrow("HTTPS"));
  it("does not leak an invalid secret in errors", () => {
    expect(() =>
      parseConfiguration({ ...valid, JWT_SECRET: "sensitive" }),
    ).toThrow("JWT_SECRET");
    try {
      parseConfiguration({ ...valid, JWT_SECRET: "sensitive" });
    } catch (e) {
      expect(String(e)).not.toContain("sensitive");
    }
  });
});
