import { AuthManager } from "../authManager";
import {
  NotionBlock,
  NotionPageInfo,
  NotionRootPage,
  NotionPageResponse,
  TokenProvider
} from "./types";
import { NotionHttpClient } from "./client";
import { BlocksApi } from "./api/blocks";
import { PagesApi } from "./api/pages";
import { blocksToMarkdown } from "./converters/blockToMarkdown";
import { markdownToBlocks } from "./converters/markdownToBlock";

class AuthManagerTokenProvider implements TokenProvider {
  constructor(private readonly authManager: AuthManager) {}

  async getToken(): Promise<string | undefined> {
    return this.authManager.getToken();
  }
}

export class NotionApiClient {
  private readonly httpClient: NotionHttpClient;
  private readonly blocksApi: BlocksApi;
  private readonly pagesApi: PagesApi;

  constructor(authManager: AuthManager) {
    const tokenProvider = new AuthManagerTokenProvider(authManager);
    this.httpClient = new NotionHttpClient(tokenProvider);
    this.blocksApi = new BlocksApi(this.httpClient);
    this.pagesApi = new PagesApi(this.httpClient);
  }

  clearCache(): void {
    this.httpClient.clearCache();
  }

  async getPage(pageId: string): Promise<NotionPageResponse> {
    return this.pagesApi.getPage(pageId);
  }

  async getPageTitle(pageId: string): Promise<string> {
    return this.pagesApi.getPageTitle(pageId);
  }

  async listRootPages(): Promise<NotionRootPage[]> {
    return this.pagesApi.listRootPages();
  }

  async getBlockChildren(blockId: string): Promise<NotionBlock[]> {
    return this.blocksApi.getBlockChildren(blockId);
  }

  async getChildPages(blockId: string): Promise<NotionPageInfo[]> {
    return this.pagesApi.getChildPages(blockId);
  }

  async getPageContent(pageId: string): Promise<string> {
    const blocks = await this.blocksApi.getBlockChildren(pageId);
    return blocksToMarkdown(blocks, {
      maxDepth: 10,
      getBlockChildren: (id) => this.blocksApi.getBlockChildren(id)
    });
  }

  async updatePageContent(pageId: string, markdown: string): Promise<void> {
    const existingBlocks = await this.blocksApi.getBlockChildren(pageId);
    const blocksToDelete = existingBlocks.filter(
      (block) => block.type !== "child_page" && block.type !== "child_database"
    );

    if (blocksToDelete.length > 0) {
      await this.blocksApi.deleteBlocksBatch(blocksToDelete.map(b => b.id));
    }

    const blocks = markdownToBlocks(markdown);
    if (blocks.length > 0) {
      await this.blocksApi.appendChildren(pageId, blocks);
    }
  }

  async createPage(parentPageId: string, title: string): Promise<NotionPageInfo> {
    return this.pagesApi.createPage(parentPageId, title);
  }
}
