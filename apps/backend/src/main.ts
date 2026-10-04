import { config } from "dotenv";
import { createApplication } from "./application";
import { parseConfiguration } from "./config";
config({ path: "../../.env", quiet: true });
async function main(): Promise<void> {
  const environment = parseConfiguration(process.env),
    app = await createApplication(environment);
  await app.listen(environment.BACKEND_PORT, "0.0.0.0");
}
main().catch((error) => {
  console.error(error instanceof Error ? error.name : "Startup failed");
  process.exitCode = 1;
});
