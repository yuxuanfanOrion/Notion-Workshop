import * as path from "path";
import * as vscode from "vscode";
import { AuthManager } from "./authManager";
import { NotionApiClient } from "./notionApiClient";

export interface NotionPage {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  parentId?: string;
  children?: NotionPage[];
}

export interface NotionConfig {
  defaultSyncPath: string;
  filter: string;
}

export class NotionService {
  private readonly storageUri: vscode.Uri;
  private readonly cacheFile: vscode.Uri;
  private readonly mapKey = "notionWorkshop.pageFileMap";
  private readonly apiClient: NotionApiClient;
  private cachedPages: NotionPage[] = [];

  public status = "Idle";

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly authManager: AuthManager
  ) {
    this.storageUri = context.globalStorageUri;
    this.cacheFile = vscode.Uri.joinPath(this.storageUri, "pages-cache.json");
    this.apiClient = new NotionApiClient(authManager);
  }

  async ensureStorage(): Promise<void> {
    await vscode.workspace.fs.createDirectory(this.storageUri);
    // Try to load cache
    try {
      const raw = await vscode.workspace.fs.readFile(this.cacheFile);
      this.cachedPages = JSON.parse(Buffer.from(raw).toString("utf8"));
    } catch {
      this.cachedPages = [];
    }
  }

  async isConfigured(): Promise<boolean> {
    return this.authManager.isConfigured();
  }

  getConfig(): NotionConfig {
    const config = vscode.workspace.getConfiguration("notionWorkshop");
    return {
      defaultSyncPath: config.get<string>("defaultSyncPath", "notion-sync"),
      filter: config.get<string>("filter", "")
    };
  }

  async listPages(): Promise<NotionPage[]> {
    const configured = await this.isConfigured();
    if (!configured) {
      return [];
    }
    return this.cachedPages;
  }

  async refreshPages(): Promise<NotionPage[]> {
    const configured = await this.isConfigured();
    if (!configured) {
      return [];
    }

    this.status = "Fetching pages...";
    try {
      const rootPageId = this.authManager.getRootPageId();
      if (!rootPageId) {
        throw new Error("Root page ID not configured");
      }

      // Get root page info
      const rootTitle = await this.apiClient.getPageTitle(rootPageId);
      const rootPage: NotionPage = {
        id: rootPageId,
        title: rootTitle,
        content: "",
        updatedAt: new Date().toISOString(),
        children: []
      };

      // Recursively fetch child pages
      await this.fetchChildPages(rootPage);

      this.cachedPages = [rootPage];
      await this.savePagesCache();
      this.status = "Idle";
      return this.cachedPages;
    } catch (error) {
      this.status = "Error";
      console.error("[NotionService] Failed to refresh pages:", error);
      throw error;
    }
  }

  private async fetchChildPages(page: NotionPage, depth = 0): Promise<void> {
    if (depth > 5) {
      // Prevent infinite recursion
      return;
    }

    try {
      const childPages = await this.apiClient.getChildPages(page.id);
      page.children = [];

      for (const child of childPages) {
        const childPage: NotionPage = {
          id: child.id,
          title: child.title,
          content: "",
          updatedAt: new Date().toISOString(),
          parentId: page.id
        };

        if (child.hasChildren) {
          await this.fetchChildPages(childPage, depth + 1);
        }

        page.children.push(childPage);
      }
    } catch (error) {
      console.error(`[NotionService] Failed to fetch children for ${page.id}:`, error);
    }
  }

  // Get flattened page list (for QuickPick)
  flattenPages(pages: NotionPage[], prefix = ""): Array<{ page: NotionPage; path: string }> {
    const result: Array<{ page: NotionPage; path: string }> = [];
    for (const page of pages) {
      const currentPath = prefix ? `${prefix} / ${page.title}` : page.title;
      result.push({ page, path: currentPath });
      if (page.children) {
        result.push(...this.flattenPages(page.children, currentPath));
      }
    }
    return result;
  }

  private filterPages(pages: NotionPage[], filter: string): NotionPage[] {
    const result: NotionPage[] = [];
    for (const page of pages) {
      const matchedChildren = page.children ? this.filterPages(page.children, filter) : [];
      if (page.title.includes(filter) || matchedChildren.length > 0) {
        result.push({
          ...page,
          children: matchedChildren.length > 0 ? matchedChildren : page.children
        });
      }
    }
    return result;
  }

  async pullPage(pageId: string): Promise<vscode.Uri> {
    this.status = "Pulling...";
    
    // Fetch page content from API
    const content = await this.apiClient.getPageContent(pageId);
    const page = this.findPage(this.cachedPages, pageId);
    if (!page) {
      this.status = "Idle";
      throw new Error("Page not found in cache");
    }

    page.content = content;
    page.updatedAt = new Date().toISOString();

    const syncFolder = await this.resolveSyncFolder();
    await vscode.workspace.fs.createDirectory(syncFolder);
    const pageFolder = await this.writePageFolder(syncFolder, page);
    
    await this.savePagesCache();
    this.status = "Idle";
    return pageFolder;
  }

  private async writePageFolder(parentFolder: vscode.Uri, page: NotionPage): Promise<vscode.Uri> {
    const safeName = this.formatFolderName(page.title, page.id);
    const pageFolder = vscode.Uri.joinPath(parentFolder, safeName);
    await vscode.workspace.fs.createDirectory(pageFolder);

    // Write index.md (page content)
    const indexFile = vscode.Uri.joinPath(pageFolder, "index.md");
    const fileContent = this.buildFileContent(page);
    await vscode.workspace.fs.writeFile(indexFile, Buffer.from(fileContent, "utf8"));
    this.rememberPageFile(page.id, indexFile);

    // Recursively write child pages
    if (page.children && page.children.length > 0) {
      for (const child of page.children) {
        // Also get content for child pages
        try {
          child.content = await this.apiClient.getPageContent(child.id);
        } catch (error) {
          console.error(`[NotionService] Failed to get content for ${child.id}:`, error);
        }
        await this.writePageFolder(pageFolder, child);
      }
    }

    return pageFolder;
  }

  async pushPage(pageId: string): Promise<void> {
    this.status = "Pushing...";
    const fileUri = await this.findPageFile(pageId);
    if (!fileUri) {
      this.status = "Idle";
      throw new Error("Local page file not found. Please run Pull or Open Page first.");
    }

    const raw = await vscode.workspace.fs.readFile(fileUri);
    const text = Buffer.from(raw).toString("utf8");
    const content = this.stripMetadata(text);

    // Push to Notion API
    await this.apiClient.updatePageContent(pageId, content);

    // Update cache
    const page = this.findPage(this.cachedPages, pageId);
    if (page) {
      page.content = content;
      page.updatedAt = new Date().toISOString();
      await this.savePagesCache();
    }

    this.status = "Idle";
  }

  async openPage(pageId: string): Promise<vscode.TextEditor> {
    const pageFolder = await this.pullPage(pageId);
    const indexFile = vscode.Uri.joinPath(pageFolder, "index.md");
    const doc = await vscode.workspace.openTextDocument(indexFile);
    return vscode.window.showTextDocument(doc, { preview: false });
  }

  async getPageIdFromDocument(document: vscode.TextDocument): Promise<string | undefined> {
    const firstLine = document.lineAt(0).text;
    const match = firstLine.match(/notion-id:\s*([\w-]+)/i);
    if (match) {
      return match[1];
    }
    const map = this.context.workspaceState.get<Record<string, string>>(this.mapKey, {});
    const entries = Object.entries(map);
    for (const [pageId, filePath] of entries) {
      if (filePath === document.uri.fsPath) {
        return pageId;
      }
    }
    return undefined;
  }

  rememberPageFile(pageId: string, fileUri: vscode.Uri): void {
    const map = this.context.workspaceState.get<Record<string, string>>(this.mapKey, {});
    map[pageId] = fileUri.fsPath;
    void this.context.workspaceState.update(this.mapKey, map);
  }

  private findPage(pages: NotionPage[], pageId: string): NotionPage | undefined {
    for (const page of pages) {
      if (page.id === pageId) {
        return page;
      }
      if (page.children) {
        const found = this.findPage(page.children, pageId);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }

  private async resolveSyncFolder(): Promise<vscode.Uri> {
    const config = this.getConfig();
    const workspace = vscode.workspace.workspaceFolders?.[0];
    if (path.isAbsolute(config.defaultSyncPath)) {
      return vscode.Uri.file(config.defaultSyncPath);
    }
    if (workspace) {
      return vscode.Uri.joinPath(workspace.uri, config.defaultSyncPath || "notion-sync");
    }
    return vscode.Uri.joinPath(this.storageUri, "notion-sync");
  }

  private async findPageFile(pageId: string): Promise<vscode.Uri | undefined> {
    const map = this.context.workspaceState.get<Record<string, string>>(this.mapKey, {});
    const mapped = map[pageId];
    if (mapped) {
      return vscode.Uri.file(mapped);
    }
    return undefined;
  }

  private formatFolderName(title: string, id: string): string {
    const safeTitle = title.replace(/[^\w\u4e00-\u9fa5-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    return `${safeTitle || "notion"}-${id}`;
  }

  private buildFileContent(page: NotionPage): string {
    return `<!-- notion-id: ${page.id} -->\n${page.content.trim()}\n`;
  }

  private stripMetadata(text: string): string {
    return text.replace(/^<!--\s*notion-id:[^>]*-->\s*/i, "").trim() + "\n";
  }

  private async savePagesCache(): Promise<void> {
    const payload = JSON.stringify(this.cachedPages, null, 2);
    await vscode.workspace.fs.writeFile(this.cacheFile, Buffer.from(payload, "utf8"));
  }
}
