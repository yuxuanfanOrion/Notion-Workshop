import {
  IHttpClient,
  NotionPageInfo,
  NotionRootPage,
  NotionPageResponse,
  NotionPageProperties,
  NotionSearchResponse,
  NotionRichText
} from "../types";
import { BlocksApi } from "./blocks";

export class PagesApi {
  private readonly blocksApi: BlocksApi;

  constructor(private readonly client: IHttpClient) {
    this.blocksApi = new BlocksApi(client);
  }

  async getPage(pageId: string): Promise<NotionPageResponse> {
    return this.client.request<NotionPageResponse>("GET", `/pages/${pageId}`);
  }

  async getPageTitle(pageId: string): Promise<string> {
    try {
      const page = await this.getPage(pageId);
      const title = this.extractTitleFromProperties(page.properties);
      if (title) {
        return title;
      }

      // Try getting block info (for child_page type)
      try {
        const block = await this.blocksApi.getBlock(pageId);
        if (block.type === "child_page" && block.child_page?.title) {
          return block.child_page.title;
        }
      } catch {
        // Block fetch failed, continue
      }

      // Check for page title in different formats
      const anyPage = page as unknown as Record<string, unknown>;
      if (anyPage.title && typeof anyPage.title === "string") {
        return anyPage.title;
      }

      return "Untitled";
    } catch (error) {
      console.error("[PagesApi] Failed to get page title:", error);
      return "Untitled";
    }
  }

  async listRootPages(): Promise<NotionRootPage[]> {
    const allPages: NotionPageResponse[] = [];
    let cursor: string | undefined;

    do {
      const response = await this.client.request<NotionSearchResponse>("POST", "/search", {
        filter: { property: "object", value: "page" },
        start_cursor: cursor,
        page_size: 50,
        sort: { direction: "descending", timestamp: "last_edited_time" }
      });
      allPages.push(...response.results);
      cursor = response.has_more ? response.next_cursor : undefined;
    } while (cursor);

    const rootPages: NotionRootPage[] = [];
    for (const page of allPages) {
      const parentType = page.parent?.type || "";
      if (parentType !== "workspace" && parentType !== "user") {
        continue;
      }
      const title = this.extractTitleFromProperties(page.properties) || "Untitled";
      rootPages.push({
        id: page.id,
        title,
        parentType
      });
    }

    rootPages.sort((a, b) => a.title.localeCompare(b.title, "en"));
    return rootPages;
  }

  async getChildPages(blockId: string): Promise<NotionPageInfo[]> {
    const blocks = await this.blocksApi.getBlockChildren(blockId);
    const pages: NotionPageInfo[] = [];

    for (const block of blocks) {
      if (block.type === "child_page") {
        const childPage = block as unknown as {
          id: string;
          child_page: { title: string };
          has_children: boolean;
        };
        pages.push({
          id: block.id,
          title: childPage.child_page?.title || "Untitled",
          hasChildren: block.has_children
        });
      }
    }

    return pages;
  }

  async createPage(parentPageId: string, title: string): Promise<NotionPageInfo> {
    const response = await this.client.request<NotionPageResponse>("POST", "/pages", {
      parent: { page_id: parentPageId },
      properties: {
        title: {
          title: [{ type: "text", text: { content: title } }]
        }
      }
    });

    return {
      id: response.id,
      title,
      hasChildren: false
    };
  }

  private extractTitleFromProperties(properties?: NotionPageProperties): string | undefined {
    if (!properties) {
      return undefined;
    }

    for (const key of Object.keys(properties)) {
      const prop = properties[key];
      if (prop && prop.type === "title" && prop.title && prop.title.length > 0) {
        return prop.title.map((t: NotionRichText) => t.plain_text).join("");
      }
    }

    const fallback = properties["title"] || properties["Name"];
    if (fallback?.title && fallback.title.length > 0) {
      return fallback.title.map((t: NotionRichText) => t.plain_text).join("");
    }

    return undefined;
  }
}
