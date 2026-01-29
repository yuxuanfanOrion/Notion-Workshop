import * as vscode from "vscode";

const TOKEN_KEY = "notionWorkshop.token";
const DATABASE_ID_KEY = "notionWorkshop.databaseId";
const ROOT_PAGE_ID_KEY = "notionWorkshop.rootPageId";

export class AuthManager {
  constructor(private readonly context: vscode.ExtensionContext) {}

  async getToken(): Promise<string | undefined> {
    return await this.context.secrets.get(TOKEN_KEY);
  }

  async setToken(token: string): Promise<void> {
    await this.context.secrets.store(TOKEN_KEY, token);
  }

  async clearToken(): Promise<void> {
    await this.context.secrets.delete(TOKEN_KEY);
  }

  getDatabaseId(): string | undefined {
    return this.context.globalState.get<string>(DATABASE_ID_KEY);
  }

  async setDatabaseId(id: string): Promise<void> {
    await this.context.globalState.update(DATABASE_ID_KEY, id);
  }

  getRootPageId(): string | undefined {
    return this.context.globalState.get<string>(ROOT_PAGE_ID_KEY);
  }

  async setRootPageId(id: string): Promise<void> {
    await this.context.globalState.update(ROOT_PAGE_ID_KEY, id);
  }

  async isConfigured(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  async clearConfig(): Promise<void> {
    await this.clearToken();
    await this.context.globalState.update(DATABASE_ID_KEY, undefined);
    await this.context.globalState.update(ROOT_PAGE_ID_KEY, undefined);
  }

  async promptForConfig(): Promise<boolean> {
    const token = await vscode.window.showInputBox({
      prompt: "Enter Notion Integration Token (starts with ntn_ or secret_)",
      placeHolder: "ntn_xxxxxxxx... or secret_xxxxxxxx...",
      password: true,
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value) {
          return "Token cannot be empty";
        }
        if (!value.startsWith("ntn_") && !value.startsWith("secret_")) {
          return "Token should start with ntn_ or secret_";
        }
        return undefined;
      }
    });

    if (!token) {
      return false;
    }

    const rootPageId = await vscode.window.showInputBox({
      prompt: "Enter the root page ID to sync (copy from Notion page URL)",
      placeHolder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value) {
          return "Please enter a page ID";
        }
        // Remove possible hyphens
        const cleanId = value.replace(/-/g, "");
        if (cleanId.length !== 32) {
          return "Page ID should be 32 characters";
        }
        return undefined;
      }
    });

    if (!rootPageId) {
      return false;
    }

    await this.setToken(token);
    await this.setRootPageId(rootPageId.replace(/-/g, ""));

    void vscode.window.showInformationMessage("Notion configuration saved. Fetching pages...");
    return true;
  }
}
