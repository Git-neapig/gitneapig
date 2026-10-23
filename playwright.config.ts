import { defineConfig, devices } from "@playwright/test";
import { readFileSync } from "node:fs";
import { X509Certificate, createHash } from "node:crypto";
const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:5173";
const localCertificate = process.env.E2E_ALLOW_SELF_SIGNED === "1";
if (
  localCertificate &&
  !["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname)
)
  throw new Error(
    "Self-signed certificate tests are restricted to loopback hosts.",
  );
const certificate =
  localCertificate && process.env.E2E_CA_CERT
    ? new X509Certificate(readFileSync(process.env.E2E_CA_CERT))
    : null;
const certificateArgs = certificate
  ? [
      `--ignore-certificate-errors-spki-list=${createHash("sha256")
        .update(certificate.publicKey.export({ type: "spki", format: "der" }))
        .digest("base64")}`,
    ]
  : [];
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  fullyParallel: false,
  use: {
    baseURL,
    ignoreHTTPSErrors: localCertificate,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        launchOptions: { args: certificateArgs },
      },
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { args: certificateArgs },
      },
    },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "edge", use: { ...devices["Desktop Edge"], channel: "msedge" } },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], launchOptions: { args: certificateArgs } },
    },
  ],
});
