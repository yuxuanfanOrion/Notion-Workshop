import * as vscode from "vscode";
import { AuthManager } from "./authManager";
import { Logger } from "./logger";
import { NotionService } from "./notionService";
import { NotionTreeProvider } from "./notionTreeProvider";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  console.log("[Notion Workshop] Extension activating...");
  const logger = new Logger();
  const authManager = new AuthManager(context);
  const notionService = new NotionService(context, authManager);
  const treeProvider = new NotionTreeProvider(notionService, authManager);

  // Register TreeView
  const treeView = vscode.window.createTreeView("notion-workshop.pages", {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });
  context.subscriptions.push(treeView);
  console.log("[Notion Workshop] TreeView registered");

  try {
    console.log("[Notion Workshop] Ensuring storage...");
    await notionService.ensureStorage();
    console.log("[Notion Workshop] Storage initialized");
  } catch (error) {
    const message = (error as Error).message || "Failed to initialize storage";
    console.error("[Notion Workshop] Storage init failed:", error);
    logger.add(message, "error");
    void vscode.window.showErrorMessage(message);
  }

  logger.add("Notion Workshop started");
  console.log("[Notion Workshop] Extension activated successfully");

  // Login/Configure command
  context.subscriptions.push(
    vscode.commands.registerCommand("notion-workshop.login", async () => {
      const success = await authManager.promptForConfig();
      if (success) {
        logger.add("Notion configured. Fetching pages...");
        try {
          await vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: "Fetching pages from Notion...",
              cancellable: false,
            },
            async () => {
              await notionService.refreshPages();
            }
          );
          logger.add("Pages fetched successfully");
          treeProvider.refresh();
          void vscode.window.showInformationMessage("Notion configured. Pages loaded.");
        } catch (error) {
          const msg = (error as Error).message || "Failed to fetch pages";
          logger.add(`Failed to fetch pages: ${msg}`, "error");
          void vscode.window.showErrorMessage(`Failed to fetch pages: ${msg}`);
        }
      }
    })
  );

  // Refresh pages command
  context.subscriptions.push(
    vscode.commands.registerCommand("notion-workshop.refresh", async () => {
      const token = await authManager.getToken();
      if (!token) {
        void vscode.window.showWarningMessage("Please configure Notion API Token first");
        return;
      }
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Refreshing page list...",
            cancellable: false,
          },
          async () => {
            await notionService.refreshPages();
          }
        );
        logger.add("Page list refreshed");
        treeProvider.refresh();
      } catch (error) {
        const msg = (error as Error).message || "Refresh failed";
        logger.add(`Refresh failed: ${msg}`, "error");
        void vscode.window.showErrorMessage(`Refresh failed: ${msg}`);
      }
    })
  );

  // Logout command
  context.subscriptions.push(
    vscode.commands.registerCommand("notion-workshop.logout", async () => {
      await authManager.clearConfig();
      logger.add("Notion configuration cleared");
      void vscode.window.showInformationMessage("Logged out from Notion");
      treeProvider.refresh();
    })
  );

  // Open page command - supports tree view and command palette
  context.subscriptions.push(
    vscode.commands.registerCommand("notion-workshop.openPage", async (item?: any) => {
      let pageId: string | undefined;
      
      // From tree view click
      if (item && item.page) {
        pageId = item.page.id;
      } else {
        // From command palette
        const pages = await notionService.listPages();
        const flatPages = notionService.flattenPages(pages);
        if (flatPages.length === 0) {
          void vscode.window.showWarningMessage("No pages found. Please refresh first.");
          return;
        }
        const pick = await vscode.window.showQuickPick(
          flatPages.map((p) => ({ label: p.path, description: p.page.id })),
          { placeHolder: "Select a Notion page to open" }
        );
        if (!pick) {
          return;
        }
        pageId = pick.description;
      }
      
      if (!pageId) {
        return;
      }
      
      try {
        await notionService.openPage(pageId);
        logger.add("Page opened");
      } catch (error) {
        logger.add(`Failed to open: ${(error as Error).message}`, "error");
        void vscode.window.showErrorMessage((error as Error).message);
      }
    })
  );

  // Pull page command - supports tree view and command palette
  context.subscriptions.push(
    vscode.commands.registerCommand("notion-workshop.pull", async (item?: any) => {
      let pageId: string | undefined;
      let pageTitle: string | undefined;
      
      // From tree view click
      if (item && item.page) {
        pageId = item.page.id;
        pageTitle = item.page.title;
      } else {
        // From command palette
        const pages = await notionService.listPages();
        const flatPages = notionService.flattenPages(pages);
        if (flatPages.length === 0) {
          void vscode.window.showWarningMessage("No pages found. Please refresh first.");
          return;
        }
        const pick = await vscode.window.showQuickPick(
          flatPages.map((p) => ({ label: p.path, description: p.page.id })),
          { placeHolder: "Select a Notion page to pull" }
        );
        if (!pick) {
          return;
        }
        pageId = pick.description;
        pageTitle = pick.label;
      }
      
      if (!pageId) {
        return;
      }
      
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Pulling ${pageTitle || pageId}...`,
            cancellable: false,
          },
          async () => {
            await notionService.pullPage(pageId!);
          }
        );
        logger.add(`Pulled page ${pageTitle || pageId}`);
        void vscode.window.showInformationMessage(`Pulled ${pageTitle || pageId}`);
      } catch (error) {
        logger.add(`Pull failed: ${(error as Error).message}`, "error");
        void vscode.window.showErrorMessage((error as Error).message);
      }
    })
  );

  // Push page command - supports tree view and command palette
  context.subscriptions.push(
    vscode.commands.registerCommand("notion-workshop.push", async (item?: any) => {
      let pageId: string | undefined;
      let pageTitle: string | undefined;
      
      // From tree view click
      if (item && item.page) {
        pageId = item.page.id;
        pageTitle = item.page.title;
      } else {
        // Try to get from current document
        const activeDoc = vscode.window.activeTextEditor?.document;
        if (activeDoc) {
          pageId = await notionService.getPageIdFromDocument(activeDoc);
        }
        
        if (!pageId) {
          // From command palette
          const pages = await notionService.listPages();
          const flatPages = notionService.flattenPages(pages);
          if (flatPages.length === 0) {
            void vscode.window.showWarningMessage("No pages found. Please refresh first.");
            return;
          }
          const pick = await vscode.window.showQuickPick(
            flatPages.map((p) => ({ label: p.path, description: p.page.id })),
            { placeHolder: "Select a Notion page to push" }
          );
          if (!pick) {
            return;
          }
          pageId = pick.description;
          pageTitle = pick.label;
        }
      }
      
      if (!pageId) {
        return;
      }
      
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Pushing ${pageTitle || pageId}...`,
            cancellable: false,
          },
          async () => {
            await notionService.pushPage(pageId!);
          }
        );
        logger.add(`Pushed page ${pageTitle || pageId}`);
        void vscode.window.showInformationMessage(`Pushed ${pageTitle || pageId}`);
      } catch (error) {
        logger.add(`Push failed: ${(error as Error).message}`, "error");
        void vscode.window.showErrorMessage((error as Error).message);
      }
    })
  );

  // Auto-push on save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      const pageId = await notionService.getPageIdFromDocument(document);
      if (!pageId) {
        return;
      }
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Auto-pushing to Notion...",
            cancellable: false,
          },
          async () => {
            await notionService.pushPage(pageId);
          }
        );
        logger.add("Auto-pushed page");
        void vscode.window.showInformationMessage("Auto-pushed to Notion");
      } catch (error) {
        logger.add(`Auto-push failed: ${(error as Error).message}`, "error");
        void vscode.window.showErrorMessage(`Auto-push failed: ${(error as Error).message}`);
      }
    })
  );

  logger.add("Notion Workshop started");
}

export function deactivate(): void {
  return;
}
