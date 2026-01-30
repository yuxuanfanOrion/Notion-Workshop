import * as assert from "assert";
import * as vscode from "vscode";

suite("Notion Workshop Extension", () => {
  test("extension activates", async () => {
    const extension = vscode.extensions.getExtension("yfanorion.notion-workshop");
    assert.ok(extension, "Extension should be present");
    await extension?.activate();
    assert.strictEqual(extension?.isActive, true);
  });

  test("commands should be registered", async () => {
    const extension = vscode.extensions.getExtension("yfanorion.notion-workshop");
    await extension?.activate();
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes("notion-workshop.login"));
    assert.ok(commands.includes("notion-workshop.push"));
    assert.ok(commands.includes("notion-workshop.refresh"));
  });
});
