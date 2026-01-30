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
    await this.migrateLegacyIndexFiles();
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

  async listRootPages(): Promise<Array<{ id: string; title: string }>> {
    const configured = await this.isConfigured();
    if (!configured) {
      return [];
    }
    const roots = await this.apiClient.listRootPages();
    return roots.map((page) => ({ id: page.id, title: page.title }));
  }

  async refreshPagesForRoot(rootPageId: string): Promise<NotionPage[]> {
    const configured = await this.isConfigured();
    if (!configured) {
      return [];
    }

    this.status = "Fetching pages...";
    try {
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

      this.cachedPages = this.upsertRootPage(this.cachedPages, rootPage);
      await this.savePagesCache();
      await this.migrateLegacyIndexFiles();
      this.status = "Idle";
      return this.cachedPages;
    } catch (error) {
      this.status = "Error";
      console.error("[NotionService] Failed to refresh pages:", error);
      throw error;
    }
  }

  clearCache(): void {
    this.cachedPages = [];
    this.apiClient.clearCache();
  }

  private async fetchChildPages(page: NotionPage, depth = 0): Promise<void> {
    if (depth > 5) {
      // Prevent infinite recursion
      return;
    }

    try {
      const childPages = await this.apiClient.getChildPages(page.id);
      page.children = [];

      // Build child page objects
      const childPageObjects: NotionPage[] = childPages.map((child) => ({
        id: child.id,
        title: child.title,
        content: "",
        updatedAt: new Date().toISOString(),
        parentId: page.id,
        children: undefined
      }));

      // Parallel fetch for children that have sub-children (with concurrency limit)
      const childrenWithSubs = childPageObjects.filter((_, i) => childPages[i].hasChildren);
      const CONCURRENCY_LIMIT = 10;
      
      for (let i = 0; i < childrenWithSubs.length; i += CONCURRENCY_LIMIT) {
        const batch = childrenWithSubs.slice(i, i + CONCURRENCY_LIMIT);
        await Promise.all(batch.map((childPage) => this.fetchChildPages(childPage, depth + 1)));
      }

      page.children = childPageObjects;
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
    const baseName = await this.resolveUniqueBaseName(parentFolder, this.formatBaseName(page.title), page.id);
    const childContainer = vscode.Uri.joinPath(parentFolder, baseName);
    await vscode.workspace.fs.createDirectory(childContainer);

    // Write <title>.md (page content) alongside its folder
    const pageFile = vscode.Uri.joinPath(parentFolder, `${baseName}.md`);
    const fileContent = this.buildFileContent(page);
    await vscode.workspace.fs.writeFile(pageFile, Buffer.from(fileContent, "utf8"));
    this.rememberPageFile(page.id, pageFile);

    // Recursively write child pages
    if (page.children && page.children.length > 0) {
      // Parallel fetch content for all children (with concurrency limit)
      const CONTENT_FETCH_BATCH_SIZE = 5;
      for (let i = 0; i < page.children.length; i += CONTENT_FETCH_BATCH_SIZE) {
        const batch = page.children.slice(i, i + CONTENT_FETCH_BATCH_SIZE);
        await Promise.all(
          batch.map(async (child) => {
            try {
              child.content = await this.apiClient.getPageContent(child.id);
            } catch (error) {
              console.error(`[NotionService] Failed to get content for ${child.id}:`, error);
            }
          })
        );
      }

      // Write folders sequentially to avoid file system race conditions
      for (const child of page.children) {
        await this.writePageFolder(childContainer, child);
      }
    }

    return childContainer;
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
    await this.pullPage(pageId);
    const pageFile = await this.findPageFile(pageId);
    if (!pageFile) {
      throw new Error("Local page file not found after pull.");
    }
    const doc = await vscode.workspace.openTextDocument(pageFile);
    return vscode.window.showTextDocument(doc, { preview: false });
  }

  async createPage(parentPageId: string, title: string): Promise<NotionPage> {
    this.status = "Creating...";
    const pageInfo = await this.apiClient.createPage(parentPageId, title);
    const newPage: NotionPage = {
      id: pageInfo.id,
      title: pageInfo.title,
      content: "",
      updatedAt: new Date().toISOString(),
      parentId: parentPageId,
      children: []
    };

    let parent = this.findPage(this.cachedPages, parentPageId);
    if (!parent) {
      this.status = "Idle";
      throw new Error("Parent page not found in cache. Expand the root page first.");
    }
    parent.children = parent.children || [];
    parent.children.push(newPage);

    await this.savePagesCache();
    this.status = "Idle";
    return newPage;
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

  private formatBaseName(title: string): string {
    return title.replace(/[^\w\u4e00-\u9fa5-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "notion";
  }

  private async migrateLegacyIndexFiles(): Promise<void> {
    const syncFolder = await this.resolveSyncFolder();
    try {
      await vscode.workspace.fs.stat(syncFolder);
    } catch {
      return;
    }

    await this.migrateFolderRecursive(syncFolder);
  }

  private async migrateFolderRecursive(folder: vscode.Uri): Promise<void> {
    let currentFolder = folder;
    let entries: [string, vscode.FileType][];
    try {
      entries = await vscode.workspace.fs.readDirectory(currentFolder);
    } catch {
      return;
    }

    const hasIndex = entries.some(([name, type]) => name === "index.md" && type === vscode.FileType.File);
    if (hasIndex) {
      const indexFile = vscode.Uri.joinPath(currentFolder, "index.md");
      const pageId = await this.extractPageId(indexFile);
      const parentFolder = vscode.Uri.joinPath(currentFolder, "..");
      const fallbackTitle = this.guessTitleFromFolder(currentFolder);
      const title = pageId ? this.findPage(this.cachedPages, pageId)?.title || fallbackTitle : fallbackTitle;
      const baseName = this.formatBaseName(title || "notion");
      const finalBase = await this.resolveUniqueBaseName(parentFolder, baseName, pageId || "");
      const targetFolder = vscode.Uri.joinPath(parentFolder, finalBase);

      if (currentFolder.fsPath !== targetFolder.fsPath) {
        try {
          await vscode.workspace.fs.rename(currentFolder, targetFolder, { overwrite: false });
          currentFolder = targetFolder;
        } catch {
          // If rename fails, continue in-place
        }
      }

      const targetFile = vscode.Uri.joinPath(parentFolder, `${finalBase}.md`);
      try {
        await vscode.workspace.fs.rename(vscode.Uri.joinPath(currentFolder, "index.md"), targetFile, { overwrite: true });
      } catch {
        // Ignore rename failure
      }

      if (pageId) {
        this.rememberPageFile(pageId, targetFile);
      }
    }

    // Re-read entries after potential rename
    try {
      entries = await vscode.workspace.fs.readDirectory(currentFolder);
    } catch {
      return;
    }

    for (const [name, type] of entries) {
      if (type === vscode.FileType.Directory) {
        await this.migrateFolderRecursive(vscode.Uri.joinPath(currentFolder, name));
      }
    }
  }

  private async extractPageId(fileUri: vscode.Uri): Promise<string | undefined> {
    try {
      const raw = await vscode.workspace.fs.readFile(fileUri);
      const text = Buffer.from(raw).toString("utf8");
      const firstLine = text.split(/\r?\n/, 1)[0] || "";
      const match = firstLine.match(/notion-id:\s*([\w-]+)/i);
      return match?.[1];
    } catch {
      return undefined;
    }
  }

  private guessTitleFromFolder(folder: vscode.Uri): string {
    const name = path.basename(folder.fsPath);
    const match = name.match(/^(.*)-[0-9a-fA-F-]{6,}$/);
    return match?.[1] || name;
  }

  private async resolveUniqueBaseName(parentFolder: vscode.Uri, baseName: string, pageId: string): Promise<string> {
    for (let i = 0; i < 200; i++) {
      const candidate = i === 0 ? baseName : `${baseName}_${i}`;
      const candidateFile = vscode.Uri.joinPath(parentFolder, `${candidate}.md`);
      const candidateFolder = vscode.Uri.joinPath(parentFolder, candidate);

      const fileMatches = pageId ? await this.fileHasPageId(candidateFile, pageId) : false;
      if (fileMatches) {
        return candidate;
      }

      const fileExists = await this.exists(candidateFile);
      const folderExists = await this.exists(candidateFolder);
      if (!fileExists && !folderExists) {
        return candidate;
      }
    }
    return `${baseName}_${Date.now()}`;
  }

  private async fileHasPageId(fileUri: vscode.Uri, pageId: string): Promise<boolean> {
    try {
      const raw = await vscode.workspace.fs.readFile(fileUri);
      const text = Buffer.from(raw).toString("utf8");
      const firstLine = text.split(/\r?\n/, 1)[0] || "";
      const match = firstLine.match(/notion-id:\s*([\w-]+)/i);
      return match?.[1] === pageId;
    } catch {
      return false;
    }
  }

  private async exists(uri: vscode.Uri): Promise<boolean> {
    try {
      await vscode.workspace.fs.stat(uri);
      return true;
    } catch {
      return false;
    }
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

  private upsertRootPage(pages: NotionPage[], rootPage: NotionPage): NotionPage[] {
    const next = pages.filter((page) => page.id !== rootPage.id);
    next.push(rootPage);
    return next;
  }
}
