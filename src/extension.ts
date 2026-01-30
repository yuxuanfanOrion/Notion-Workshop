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

  // Non-blocking storage initialization (runs in background)
  notionService.ensureStorage().then(() => {
    console.log("[Notion Workshop] Storage initialized");
    treeProvider.refresh(); // Refresh tree after cache is loaded
  }).catch((error) => {
    const message = (error as Error).message || "Failed to initialize storage";
    console.error("[Notion Workshop] Storage init failed:", error);
    logger.add(message, "error");
    void vscode.window.showErrorMessage(message);
  });

  logger.add("Notion Workshop started");
  console.log("[Notion Workshop] Extension activated successfully");

  // Login/Configure command
  context.subscriptions.push(
    vscode.commands.registerCommand("notion-workshop.login", async () => {
      const success = await authManager.promptForConfig();
      if (success) {
        logger.add("Notion configured.");
        await authManager.setActiveRootPageId(undefined);
        notionService.clearCache();
        treeProvider.refresh();
        void vscode.window.showInformationMessage("Notion configured. Select a root page from the sidebar.");
      }
    })
  );

  // Refresh pages command
  context.subscriptions.push(
    vscode.commands.registerCommand("notion-workshop.refresh", async () => {
      const token = await authManager.getToken();
      if (!token) {
        void vscode.window.showWarningMessage("Please configure Notion token first");
        return;
      }
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Refreshing root list...",
            cancellable: false,
          },
          async () => {
            await authManager.setActiveRootPageId(undefined);
            notionService.clearCache();
          }
        );
        logger.add("Root list refreshed");
        treeProvider.refresh();
      } catch (error) {
        const msg = (error as Error).message || "Refresh failed";
        logger.add(`Refresh failed: ${msg}`, "error");
        void vscode.window.showErrorMessage(`Refresh failed: ${msg}`);
      }
    })
  );

  // Select root page (focus mode)
  context.subscriptions.push(
    vscode.commands.registerCommand("notion-workshop.selectRoot", async (item?: any) => {
      const rootId: string | undefined = item?.page?.id;
      if (!rootId) {
        return;
      }
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Loading root page...",
            cancellable: false,
          },
          async () => {
            await authManager.setActiveRootPageId(rootId);
            await notionService.refreshPagesForRoot(rootId);
          }
        );
        treeProvider.refresh();
      } catch (error) {
        const msg = (error as Error).message || "Failed to load root page";
        logger.add(`Root selection failed: ${msg}`, "error");
        void vscode.window.showErrorMessage(msg);
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
          void vscode.window.showWarningMessage("No pages cached. Expand a root page first.");
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

  // Create page command - supports tree view and command palette
  context.subscriptions.push(
    vscode.commands.registerCommand("notion-workshop.createPage", async (item?: any) => {
      let parentPageId: string | undefined;
      let parentTitle: string | undefined;

      if (item && item.page) {
        parentPageId = item.page.id;
        parentTitle = item.page.title;
      } else {
        const pages = await notionService.listPages();
        const flatPages = notionService.flattenPages(pages);
        if (flatPages.length === 0) {
          void vscode.window.showWarningMessage("No pages cached. Expand a root page first.");
          return;
        }
        const pick = await vscode.window.showQuickPick(
          flatPages.map((p) => ({ label: p.path, description: p.page.id })),
          { placeHolder: "Select a parent page" }
        );
        if (!pick) {
          return;
        }
        parentPageId = pick.description;
        parentTitle = pick.label;
      }

      if (!parentPageId) {
        return;
      }

      const title = await vscode.window.showInputBox({
        prompt: `New page title${parentTitle ? ` (under ${parentTitle})` : ""}`,
        validateInput: (value) => (value.trim().length === 0 ? "Title cannot be empty" : undefined)
      });

      if (!title) {
        return;
      }

      try {
        const newPage = await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Creating ${title}...`,
            cancellable: false,
          },
          async () => {
            return await notionService.createPage(parentPageId!, title.trim());
          }
        );

        logger.add(`Created page ${title}`);
        treeProvider.refresh();
        await notionService.openPage(newPage.id);
      } catch (error) {
        logger.add(`Create failed: ${(error as Error).message}`, "error");
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
            void vscode.window.showWarningMessage("No pages cached. Expand a root page first.");
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

  // Auto-push on save with debounce
  const autoPushDebounceMap = new Map<string, NodeJS.Timeout>();
  const AUTO_PUSH_DELAY_MS = 2000; // Wait 2 seconds after last save

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      const pageId = await notionService.getPageIdFromDocument(document);
      if (!pageId) {
        return;
      }

      // Clear existing debounce timer for this page
      const existingTimer = autoPushDebounceMap.get(pageId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new debounce timer
      const timer = setTimeout(async () => {
        autoPushDebounceMap.delete(pageId);
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
      }, AUTO_PUSH_DELAY_MS);

      autoPushDebounceMap.set(pageId, timer);
    })
  );

  // Cleanup debounce timers on deactivate
  context.subscriptions.push({
    dispose: () => {
      for (const timer of autoPushDebounceMap.values()) {
        clearTimeout(timer);
      }
      autoPushDebounceMap.clear();
    }
  });
}

export function deactivate(): void {
  return;
}
