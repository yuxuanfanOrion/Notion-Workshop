import * as vscode from "vscode";
import { AuthManager } from "./authManager";
import { NotionPage, NotionService } from "./notionService";

// Tree item base class
class NotionTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }
}

// Login item (shown when not logged in)
class LoginItem extends NotionTreeItem {
  constructor() {
    super("Click to configure Notion API", vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon("log-in");
    this.command = {
      command: "notion-workshop.login",
      title: "Configure Notion",
    };
    this.contextValue = "login";
  }
}

// Page item
class PageItem extends NotionTreeItem {
  constructor(
    public readonly page: NotionPage,
    public readonly hasChildren: boolean
  ) {
    super(
      page.title,
      hasChildren
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );
    this.iconPath = new vscode.ThemeIcon(hasChildren ? "folder" : "file-text");
    this.contextValue = "page";
    this.tooltip = page.title;
    this.description = page.id.substring(0, 8) + "...";
    // Open (auto-pull) on click
    this.command = {
      command: "notion-workshop.openPage",
      title: "Open Page",
      arguments: [this],
    };
  }
}

// Root page item
class RootPageItem extends NotionTreeItem {
  constructor(
    public readonly page: NotionPage,
    collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(page.title, collapsibleState);
    this.iconPath = new vscode.ThemeIcon("folder");
    this.contextValue = "rootPage";
    this.tooltip = page.title;
    this.description = page.id.substring(0, 8) + "...";
  }
}

// Loading item
class LoadingItem extends NotionTreeItem {
  constructor() {
    super("Loading...", vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon("loading~spin");
  }
}

// Empty item
class EmptyItem extends NotionTreeItem {
  constructor(message: string) {
    super(message, vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon("info");
  }
}

export class NotionTreeProvider
  implements vscode.TreeDataProvider<NotionTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    NotionTreeItem | undefined | void
  > = new vscode.EventEmitter<NotionTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<NotionTreeItem | undefined | void> =
    this._onDidChangeTreeData.event;

  private pageCache: Map<string, NotionPage[]> = new Map();

  constructor(
    private readonly notionService: NotionService,
    private readonly authManager: AuthManager
  ) {}

  refresh(): void {
    this.pageCache.clear();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: NotionTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: NotionTreeItem): Promise<NotionTreeItem[]> {
    // Show login button if not configured
    const isConfigured = await this.authManager.isConfigured();
    if (!isConfigured) {
      return [new LoginItem()];
    }

    // Root node: list root pages or a selected root
    if (!element) {
      try {
        const activeRootId = this.authManager.getActiveRootPageId();
        if (activeRootId) {
          const cachedRoots = await this.notionService.listPages();
          let root = cachedRoots.find((page) => page.id === activeRootId);
          if (!root) {
            const refreshed = await this.notionService.refreshPagesForRoot(activeRootId);
            root = refreshed.find((page) => page.id === activeRootId);
          }
          if (!root) {
            return [new EmptyItem("Selected root page not found. Refresh and try again.")];
          }
          return [new RootPageItem(root, vscode.TreeItemCollapsibleState.Collapsed)];
        }

        const roots = await this.notionService.listRootPages();
        if (roots.length === 0) {
          return [new EmptyItem("No root pages found. Share pages with your integration and refresh.")];
        }
        return roots.map(
          (root) =>
            new RootPageItem({
              id: root.id,
              title: root.title,
              content: "",
              updatedAt: new Date().toISOString(),
              children: []
            }, vscode.TreeItemCollapsibleState.None)
        );
      } catch (error) {
        return [new EmptyItem(`Failed to fetch: ${(error as Error).message}`)];
      }
    }

    // Root page children
    if (element instanceof RootPageItem) {
      try {
        const cachedRoot = await this.notionService.listPages();
        const found = cachedRoot.find((page) => page.id === element.page.id);
        const root = found || (await this.notionService.refreshPagesForRoot(element.page.id)).find(
          (page) => page.id === element.page.id
        );
        const children = root?.children || [];
        if (children.length === 0) {
          return [new EmptyItem("No pages under this root.")];
        }
        return children.map(
          (page) => new PageItem(page, !!(page.children && page.children.length > 0))
        );
      } catch (error) {
        return [new EmptyItem(`Failed to fetch: ${(error as Error).message}`)];
      }
    }

    // Child nodes: get sub-pages
    if (element instanceof PageItem) {
      const children = element.page.children || [];
      if (children.length === 0) {
        return [];
      }
      return children.map(
        (child) =>
          new PageItem(child, !!(child.children && child.children.length > 0))
      );
    }

    return [];
  }

  // Get page ID
  getPageId(item: NotionTreeItem): string | undefined {
    if (item instanceof PageItem) {
      return item.page.id;
    }
    return undefined;
  }
}
