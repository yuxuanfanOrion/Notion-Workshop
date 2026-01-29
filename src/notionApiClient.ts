import * as vscode from "vscode";
import { AuthManager } from "./authManager";

export interface NotionBlock {
  id: string;
  type: string;
  has_children: boolean;
  [key: string]: unknown;
}

export interface NotionPageInfo {
  id: string;
  title: string;
  hasChildren: boolean;
}

interface NotionRichText {
  plain_text: string;
}

interface NotionPropertyValue {
  type?: string;
  title?: NotionRichText[];
}

interface NotionPageProperties {
  [key: string]: NotionPropertyValue | undefined;
}

interface NotionPageResponse {
  id: string;
  properties?: NotionPageProperties;
  // child_page has title directly
  child_page?: {
    title: string;
  };
}

interface NotionBlockResponse {
  id: string;
  type: string;
  child_page?: {
    title: string;
  };
}

interface NotionBlocksResponse {
  results: NotionBlock[];
  has_more: boolean;
  next_cursor?: string;
}

export class NotionApiClient {
  private readonly baseUrl = "https://api.notion.com/v1";
  private readonly apiVersion = "2022-06-28";

  constructor(private readonly authManager: AuthManager) {}

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await this.authManager.getToken();
    if (!token) {
      throw new Error("Notion Token not configured");
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": this.apiVersion
    };
  }

  private async request<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
    const headers = await this.getHeaders();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[NotionApiClient] API error:", response.status, error);
      throw new Error(`Notion API error: ${response.status} - ${error}`);
    }

    return (await response.json()) as T;
  }

  private async getBlock(blockId: string): Promise<NotionBlockResponse> {
    return this.request<NotionBlockResponse>("GET", `/blocks/${blockId}`);
  }

  async getPage(pageId: string): Promise<NotionPageResponse> {
    return this.request<NotionPageResponse>("GET", `/pages/${pageId}`);
  }

  async getPageTitle(pageId: string): Promise<string> {
    try {
      // Try getting page properties first
      const page = await this.getPage(pageId);
      console.log("[NotionApiClient] Page response:", JSON.stringify(page, null, 2));
      
      const title = this.extractTitleFromProperties(page.properties);
      if (title) {
        console.log("[NotionApiClient] Found title from properties:", title);
        return title;
      }
      
      // Try getting block info (for child_page type)
      try {
        const block = await this.getBlock(pageId);
        console.log("[NotionApiClient] Block response:", JSON.stringify(block, null, 2));
        if (block.type === "child_page" && block.child_page?.title) {
          console.log("[NotionApiClient] Found title from block:", block.child_page.title);
          return block.child_page.title;
        }
      } catch (blockError) {
        console.log("[NotionApiClient] Block fetch failed, trying page title from icon/cover");
      }
      
      // Check for page title in different formats
      const anyPage = page as unknown as Record<string, unknown>;
      if (anyPage.title && typeof anyPage.title === "string") {
        return anyPage.title;
      }
      
      console.log("[NotionApiClient] No title found, returning Untitled");
      return "Untitled";
    } catch (error) {
      console.error("[NotionApiClient] Failed to get page title:", error);
      return "Untitled";
    }
  }

  private extractTitleFromProperties(properties?: NotionPageProperties): string | undefined {
    if (!properties) {
      return undefined;
    }

    for (const key of Object.keys(properties)) {
      const prop = properties[key];
      if (prop && prop.type === "title" && prop.title && prop.title.length > 0) {
        return prop.title.map((t) => t.plain_text).join("");
      }
    }

    const fallback = properties["title"] || properties["Name"];
    if (fallback?.title && fallback.title.length > 0) {
      return fallback.title.map((t) => t.plain_text).join("");
    }

    return undefined;
  }

  async getBlockChildren(blockId: string): Promise<NotionBlock[]> {
    const allBlocks: NotionBlock[] = [];
    let cursor: string | undefined;

    do {
      const params = cursor ? `?start_cursor=${cursor}` : "";
      const response = await this.request<NotionBlocksResponse>(
        "GET",
        `/blocks/${blockId}/children${params}`
      );
      allBlocks.push(...response.results);
      cursor = response.has_more ? response.next_cursor : undefined;
    } while (cursor);

    return allBlocks;
  }

  async getChildPages(blockId: string): Promise<NotionPageInfo[]> {
    const blocks = await this.getBlockChildren(blockId);
    const pages: NotionPageInfo[] = [];

    for (const block of blocks) {
      if (block.type === "child_page") {
        const childPage = block as unknown as { id: string; child_page: { title: string }; has_children: boolean };
        pages.push({
          id: block.id,
          title: childPage.child_page?.title || "Untitled",
          hasChildren: block.has_children
        });
      }
    }

    return pages;
  }

  async getPageContent(pageId: string): Promise<string> {
    const blocks = await this.getBlockChildren(pageId);
    return this.blocksToMarkdown(blocks);
  }

  private blocksToMarkdown(blocks: NotionBlock[]): string {
    const lines: string[] = [];

    for (const block of blocks) {
      const line = this.blockToMarkdown(block);
      if (line !== null) {
        lines.push(line);
      }
    }

    return lines.join("\n\n");
  }

  private blockToMarkdown(block: NotionBlock): string | null {
    const type = block.type;
    const data = block[type] as Record<string, unknown> | undefined;

    if (!data) {
      return null;
    }

    switch (type) {
      case "paragraph":
        return this.richTextToMarkdown(data.rich_text as NotionRichText[]);

      case "heading_1":
        return `# ${this.richTextToMarkdown(data.rich_text as NotionRichText[])}`;

      case "heading_2":
        return `## ${this.richTextToMarkdown(data.rich_text as NotionRichText[])}`;

      case "heading_3":
        return `### ${this.richTextToMarkdown(data.rich_text as NotionRichText[])}`;

      case "bulleted_list_item":
        return `- ${this.richTextToMarkdown(data.rich_text as NotionRichText[])}`;

      case "numbered_list_item":
        return `1. ${this.richTextToMarkdown(data.rich_text as NotionRichText[])}`;

      case "to_do": {
        const checked = data.checked ? "x" : " ";
        return `- [${checked}] ${this.richTextToMarkdown(data.rich_text as NotionRichText[])}`;
      }

      case "toggle":
        return `<details><summary>${this.richTextToMarkdown(data.rich_text as NotionRichText[])}</summary></details>`;

      case "code": {
        const language = (data.language as string) || "";
        const code = this.richTextToMarkdown(data.rich_text as NotionRichText[]);
        return `\`\`\`${language}\n${code}\n\`\`\``;
      }

      case "quote":
        return `> ${this.richTextToMarkdown(data.rich_text as NotionRichText[])}`;

      case "divider":
        return "---";

      case "callout": {
        const icon = (data.icon as { emoji?: string })?.emoji || "💡";
        return `> ${icon} ${this.richTextToMarkdown(data.rich_text as NotionRichText[])}`;
      }

      case "image": {
        const imageData = data as { type: string; file?: { url: string }; external?: { url: string } };
        const url = imageData.type === "file" ? imageData.file?.url : imageData.external?.url;
        return url ? `![image](${url})` : null;
      }

      case "bookmark":
      case "link_preview": {
        const urlData = data as { url?: string };
        return urlData.url ? `[${urlData.url}](${urlData.url})` : null;
      }

      case "child_page":
        // Child pages are handled separately, skip here
        return null;

      default:
        console.log(`[NotionApiClient] Unsupported block type: ${type}`);
        return null;
    }
  }

  private richTextToMarkdown(richText: NotionRichText[] | undefined): string {
    if (!richText || !Array.isArray(richText)) {
      return "";
    }
    return richText.map((t) => t.plain_text).join("");
  }

  async updatePageContent(pageId: string, markdown: string): Promise<void> {
    // First delete all existing blocks
    const existingBlocks = await this.getBlockChildren(pageId);
    for (const block of existingBlocks) {
      if (block.type !== "child_page" && block.type !== "child_database") {
        try {
          await this.request("DELETE", `/blocks/${block.id}`);
        } catch (error) {
          console.error("[NotionApiClient] Failed to delete block:", error);
        }
      }
    }

    // Convert markdown to blocks and add
    const blocks = this.markdownToBlocks(markdown);
    if (blocks.length > 0) {
      await this.request("PATCH", `/blocks/${pageId}/children`, {
        children: blocks
      });
    }
  }

  async createPage(parentPageId: string, title: string): Promise<NotionPageInfo> {
    const response = await this.request<NotionPageResponse>("POST", "/pages", {
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

  private markdownToBlocks(markdown: string): unknown[] {
    const lines = markdown.split("\n");
    const blocks: unknown[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      // Skip notion-id comment
      if (trimmed.startsWith("<!--") && trimmed.includes("notion-id")) {
        continue;
      }

      let block: unknown = null;

      if (trimmed.startsWith("### ")) {
        block = {
          object: "block",
          type: "heading_3",
          heading_3: { rich_text: [{ type: "text", text: { content: trimmed.slice(4) } }] }
        };
      } else if (trimmed.startsWith("## ")) {
        block = {
          object: "block",
          type: "heading_2",
          heading_2: { rich_text: [{ type: "text", text: { content: trimmed.slice(3) } }] }
        };
      } else if (trimmed.startsWith("# ")) {
        block = {
          object: "block",
          type: "heading_1",
          heading_1: { rich_text: [{ type: "text", text: { content: trimmed.slice(2) } }] }
        };
      } else if (trimmed.startsWith("- [x] ") || trimmed.startsWith("- [ ] ")) {
        const checked = trimmed.startsWith("- [x] ");
        block = {
          object: "block",
          type: "to_do",
          to_do: {
            rich_text: [{ type: "text", text: { content: trimmed.slice(6) } }],
            checked
          }
        };
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        block = {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: { rich_text: [{ type: "text", text: { content: trimmed.slice(2) } }] }
        };
      } else if (/^\d+\.\s/.test(trimmed)) {
        const content = trimmed.replace(/^\d+\.\s/, "");
        block = {
          object: "block",
          type: "numbered_list_item",
          numbered_list_item: { rich_text: [{ type: "text", text: { content } }] }
        };
      } else if (trimmed.startsWith("> ")) {
        block = {
          object: "block",
          type: "quote",
          quote: { rich_text: [{ type: "text", text: { content: trimmed.slice(2) } }] }
        };
      } else if (trimmed === "---") {
        block = { object: "block", type: "divider", divider: {} };
      } else {
        block = {
          object: "block",
          type: "paragraph",
          paragraph: { rich_text: [{ type: "text", text: { content: trimmed } }] }
        };
      }

      if (block) {
        blocks.push(block);
      }
    }

    return blocks;
  }
}
