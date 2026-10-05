import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { config } from "dotenv";
config({ path: "../../.env", quiet: true });
const require = createRequire(import.meta.url);
const child = spawn(
  process.execPath,
  [require.resolve("prisma/build/index.js"), ...process.argv.slice(2)],
  { stdio: "inherit" },
);
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
