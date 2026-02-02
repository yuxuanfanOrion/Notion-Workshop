import * as vscode from "vscode";
import * as os from "os";
import * as path from "path";

const TOKEN_KEY = "notionWorkshop.token";
const DATABASE_ID_KEY = "notionWorkshop.databaseId";
const ROOT_PAGE_ID_KEY = "notionWorkshop.rootPageId";
const ACTIVE_ROOT_PAGE_ID_KEY = "notionWorkshop.activeRootPageId";
const SYNC_PATH_KEY = "notionWorkshop.syncPath";

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

  getActiveRootPageId(): string | undefined {
    return this.context.globalState.get<string>(ACTIVE_ROOT_PAGE_ID_KEY);
  }

  async setActiveRootPageId(id?: string): Promise<void> {
    await this.context.globalState.update(ACTIVE_ROOT_PAGE_ID_KEY, id);
  }

  getSyncPath(): string | undefined {
    return this.context.globalState.get<string>(SYNC_PATH_KEY);
  }

  async setSyncPath(syncPath: string): Promise<void> {
    await this.context.globalState.update(SYNC_PATH_KEY, syncPath);
  }

  async promptForSyncPath(): Promise<string | undefined> {
    const sep = path.sep;
    const inputBox = vscode.window.createQuickPick();
    inputBox.title = "Select Notion Sync Folder";
    inputBox.placeholder = `e.g., ${os.homedir()}${sep}Notion`;
    inputBox.value = os.homedir() + sep;
    inputBox.ignoreFocusOut = true;

    return new Promise((resolve) => {
      // Auto-complete directory navigation
      inputBox.onDidChangeValue(async (value) => {
        try {
          inputBox.busy = true;
          const dirPath = value.split(sep).slice(0, -1).join(sep) || sep;
          const items = await vscode.workspace.fs.readDirectory(vscode.Uri.file(dirPath));
          const subDirs = items
            .filter(([, type]) => type === vscode.FileType.Directory)
            .filter(([name]) => `${dirPath}${sep}${name}`.startsWith(value));
          inputBox.busy = false;

          if (subDirs.length !== 0) {
            const candidates = subDirs.map(([name]) => ({ label: name, alwaysShow: true }));
            if (dirPath !== sep) {
              candidates.unshift({ label: "..", alwaysShow: true });
            }
            inputBox.items = candidates;
          }
        } catch {
          inputBox.busy = false;
        } finally {
          inputBox.activeItems = [];
        }
      });

      // Handle directory selection
      inputBox.onDidAccept(() => {
        if (inputBox.activeItems.length !== 0) {
          const selected = inputBox.selectedItems[0];
          const dirPath = inputBox.value.split(sep).slice(0, -1).join(sep);
          inputBox.value = selected.label === ".." ? dirPath + sep : `${dirPath}${sep}${selected.label}${sep}`;
        } else {
          // User confirmed the path
          const finalPath = inputBox.value.endsWith(sep) ? inputBox.value.slice(0, -1) : inputBox.value;
          inputBox.hide();
          resolve(finalPath);
        }
      });

      inputBox.onDidHide(() => {
        inputBox.dispose();
        resolve(undefined);
      });

      // Add confirm button
      inputBox.buttons = [vscode.QuickInputButtons.Back];
      inputBox.onDidTriggerButton((button) => {
        if (button === vscode.QuickInputButtons.Back) {
          const finalPath = inputBox.value.endsWith(sep) ? inputBox.value.slice(0, -1) : inputBox.value;
          inputBox.hide();
          resolve(finalPath);
        }
      });

      inputBox.show();
    });
  }

  async isConfigured(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  async clearConfig(): Promise<void> {
    await this.clearToken();
    await this.context.globalState.update(DATABASE_ID_KEY, undefined);
    await this.context.globalState.update(ROOT_PAGE_ID_KEY, undefined);
    await this.context.globalState.update(ACTIVE_ROOT_PAGE_ID_KEY, undefined);
    await this.context.globalState.update(SYNC_PATH_KEY, undefined);
  }

  async promptForConfig(): Promise<boolean> {
    const token = await vscode.window.showInputBox({
      prompt: "Enter Notion integration token (starts with ntn_ or secret_)",
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

    await this.setToken(token);
    await this.context.globalState.update(ROOT_PAGE_ID_KEY, undefined);

    void vscode.window.showInformationMessage("Notion configuration saved.");
    return true;
  }
}
