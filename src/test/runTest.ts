import * as path from "path";
import { runTests } from "@vscode/test-electron";

async function main(): Promise<void> {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");
    const extensionTestsPath = path.resolve(__dirname, "./suite/index");

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to run tests", error);
    process.exit(1);
  }
}

void main();
