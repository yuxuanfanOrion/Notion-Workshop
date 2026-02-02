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

export interface NotionRootPage {
  id: string;
  title: string;
  parentType: string;
}

interface NotionRichText {
  type: "text" | "mention" | "equation";
  plain_text: string;
  href?: string | null;
  text?: {
    content: string;
    link?: { url: string } | null;
  };
  annotations?: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
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
  parent?: {
    type?: string;
    page_id?: string;
    database_id?: string;
    workspace?: boolean;
  };
}

interface NotionSearchResponse {
  results: NotionPageResponse[];
  has_more: boolean;
  next_cursor?: string;
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
  
  // Request cache with TTL (30 seconds for read operations)
  private readonly requestCache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_TTL_MS = 30000;

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

  private getCachedResult<T>(cacheKey: string): T | undefined {
    const cached = this.requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data as T;
    }
    if (cached) {
      this.requestCache.delete(cacheKey);
    }
    return undefined;
  }

  private setCachedResult(cacheKey: string, data: unknown): void {
    this.requestCache.set(cacheKey, { data, timestamp: Date.now() });
    // Cleanup old entries if cache grows too large
    if (this.requestCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of this.requestCache) {
        if (now - value.timestamp > this.CACHE_TTL_MS) {
          this.requestCache.delete(key);
        }
      }
    }
  }

  clearCache(): void {
    this.requestCache.clear();
  }

  private async request<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
    // Only cache GET requests
    const cacheKey = method === "GET" ? `${method}:${endpoint}` : "";
    if (cacheKey) {
      const cached = this.getCachedResult<T>(cacheKey);
      if (cached !== undefined) {
        return cached;
      }
    }

    const headers = await this.getHeaders();

    // Retry logic for network errors
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Add 30-second timeout using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.text();
          console.error("[NotionApiClient] API error:", response.status, error);
          throw new Error(`Notion API error: ${response.status} - ${error}`);
        }

        const result = (await response.json()) as T;

        if (cacheKey) {
          this.setCachedResult(cacheKey, result);
        }

        return result;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        lastError = fetchError as Error;

        // Don't retry on API errors (4xx, 5xx), only on network errors
        if (lastError.message.startsWith("Notion API error:")) {
          throw lastError;
        }

        console.warn(`[NotionApiClient] Attempt ${attempt}/${maxRetries} failed for ${endpoint}:`, lastError.message);

        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    console.error("[NotionApiClient] All retries failed for:", endpoint);
    throw new Error(`Network error after ${maxRetries} retries: ${lastError?.message}`);
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

  async listRootPages(): Promise<NotionRootPage[]> {
    const allPages: NotionPageResponse[] = [];
    let cursor: string | undefined;

    do {
      const response = await this.request<NotionSearchResponse>("POST", "/search", {
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
    return await this.blocksToMarkdown(blocks, 0, 10);
  }

  private getIndent(depth: number): string {
    return "  ".repeat(depth);
  }

  private async fetchBlockChildrenContent(
    blockId: string,
    depth: number,
    maxDepth: number
  ): Promise<string> {
    if (depth >= maxDepth) {
      return "";
    }

    try {
      const children = await this.getBlockChildren(blockId);
      if (children.length === 0) {
        return "";
      }

      return await this.blocksToMarkdown(children, depth + 1, maxDepth);
    } catch (error) {
      console.error(`[NotionApiClient] Failed to fetch children for block ${blockId}:`, error);
      return "";
    }
  }

  private async blocksToMarkdown(
    blocks: NotionBlock[],
    depth: number = 0,
    maxDepth: number = 10
  ): Promise<string> {
    // Pre-fetch children in parallel batches for better performance
    // Exclude child_page and child_database as they are handled separately
    const blocksWithChildren = blocks.filter(
      (b) => b.has_children && b.type !== "child_page" && b.type !== "child_database"
    );
    const BATCH_SIZE = 5;
    for (let i = 0; i < blocksWithChildren.length; i += BATCH_SIZE) {
      const batch = blocksWithChildren.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((b) =>
          this.getBlockChildren(b.id).catch((err) => {
            console.error(`[NotionApiClient] Pre-fetch failed for block ${b.id}:`, err);
            return [];
          })
        )
      );
    }

    const lines: string[] = [];

    for (const block of blocks) {
      const line = await this.blockToMarkdown(block, depth, maxDepth);
      if (line !== null) {
        lines.push(line);
      }
    }

    return lines.join("\n\n");
  }

  private async blockToMarkdown(
    block: NotionBlock,
    depth: number = 0,
    maxDepth: number = 10
  ): Promise<string | null> {
    const type = block.type;
    const data = block[type] as Record<string, unknown> | undefined;

    if (!data) {
      return null;
    }

    const indent = this.getIndent(depth);

    switch (type) {
      case "paragraph": {
        const text = this.richTextToMarkdown(data.rich_text as NotionRichText[]);
        return indent + text;
      }

      case "heading_1":
        return `${indent}# ${this.richTextToMarkdown(data.rich_text as NotionRichText[])}`;

      case "heading_2":
        return `${indent}## ${this.richTextToMarkdown(data.rich_text as NotionRichText[])}`;

      case "heading_3":
        return `${indent}### ${this.richTextToMarkdown(data.rich_text as NotionRichText[])}`;

      case "bulleted_list_item": {
        const text = this.richTextToMarkdown(data.rich_text as NotionRichText[]);
        let result = `${indent}- ${text}`;

        if (block.has_children) {
          const childContent = await this.fetchBlockChildrenContent(block.id, depth, maxDepth);
          if (childContent) {
            result += "\n" + childContent;
          }
        }

        return result;
      }

      case "numbered_list_item": {
        const text = this.richTextToMarkdown(data.rich_text as NotionRichText[]);
        let result = `${indent}1. ${text}`;

        if (block.has_children) {
          const childContent = await this.fetchBlockChildrenContent(block.id, depth, maxDepth);
          if (childContent) {
            result += "\n" + childContent;
          }
        }

        return result;
      }

      case "to_do": {
        const checked = data.checked ? "x" : " ";
        let result = `${indent}- [${checked}] ${this.richTextToMarkdown(data.rich_text as NotionRichText[])}`;

        if (block.has_children) {
          const childContent = await this.fetchBlockChildrenContent(block.id, depth, maxDepth);
          if (childContent) {
            result += "\n" + childContent;
          }
        }

        return result;
      }

      case "toggle": {
        const summary = this.richTextToMarkdown(data.rich_text as NotionRichText[]);
        let childContent = "";

        if (block.has_children) {
          childContent = await this.fetchBlockChildrenContent(block.id, depth, maxDepth);
        }

        if (childContent) {
          return `${indent}<details><summary>${summary}</summary>\n\n${childContent}\n\n${indent}</details>`;
        }
        return `${indent}<details><summary>${summary}</summary></details>`;
      }

      case "code": {
        const language = (data.language as string) || "";
        const code = this.richTextToMarkdown(data.rich_text as NotionRichText[]);
        return `\`\`\`${language}\n${code}\n\`\`\``;
      }

      case "quote": {
        const text = this.richTextToMarkdown(data.rich_text as NotionRichText[]);
        let result = `${indent}> ${text}`;

        if (block.has_children) {
          const childContent = await this.fetchBlockChildrenContent(block.id, depth, maxDepth);
          if (childContent) {
            const quotedChildren = childContent
              .split("\n")
              .map((line) => (line ? `${indent}> ${line}` : `${indent}>`))
              .join("\n");
            result += "\n" + quotedChildren;
          }
        }

        return result;
      }

      case "divider":
        return `${indent}---`;

      case "callout": {
        const icon = (data.icon as { emoji?: string })?.emoji || "💡";
        const text = this.richTextToMarkdown(data.rich_text as NotionRichText[]);
        let result = `${indent}> ${icon} ${text}`;

        if (block.has_children) {
          const childContent = await this.fetchBlockChildrenContent(block.id, depth, maxDepth);
          if (childContent) {
            const quotedChildren = childContent
              .split("\n")
              .map((line) => (line ? `${indent}> ${line}` : `${indent}>`))
              .join("\n");
            result += "\n" + quotedChildren;
          }
        }

        return result;
      }

      case "image": {
        const imageData = data as { type: string; file?: { url: string }; external?: { url: string } };
        const url = imageData.type === "file" ? imageData.file?.url : imageData.external?.url;
        return url ? `${indent}![image](${url})` : null;
      }

      case "bookmark":
      case "link_preview": {
        const urlData = data as { url?: string };
        return urlData.url ? `${indent}[${urlData.url}](${urlData.url})` : null;
      }

      case "column_list": {
        if (!block.has_children) {
          return null;
        }
        const childContent = await this.fetchBlockChildrenContent(block.id, depth, maxDepth);
        return childContent || null;
      }

      case "column": {
        if (!block.has_children) {
          return null;
        }
        const childContent = await this.fetchBlockChildrenContent(block.id, depth, maxDepth);
        return childContent || null;
      }

      case "synced_block": {
        const syncedFrom = (data as { synced_from?: { block_id: string } }).synced_from;

        if (syncedFrom?.block_id) {
          const originalChildren = await this.getBlockChildren(syncedFrom.block_id);
          return await this.blocksToMarkdown(originalChildren, depth, maxDepth);
        }

        if (block.has_children) {
          return await this.fetchBlockChildrenContent(block.id, depth, maxDepth);
        }

        return null;
      }

      case "table": {
        if (!block.has_children) {
          return null;
        }

        try {
          const rows = await this.getBlockChildren(block.id);
          if (rows.length === 0) {
            return null;
          }

          const tableLines: string[] = [];

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row.type !== "table_row") {
              continue;
            }

            const rowData = row.table_row as { cells?: NotionRichText[][] };
            const cells = rowData?.cells || [];
            const cellTexts = cells.map((cell) => this.richTextToMarkdown(cell));
            tableLines.push(`${indent}| ${cellTexts.join(" | ")} |`);

            // Add header separator after first row
            if (i === 0) {
              const separator = cells.map(() => "---").join(" | ");
              tableLines.push(`${indent}| ${separator} |`);
            }
          }

          return tableLines.join("\n");
        } catch (error) {
          console.error(`[NotionApiClient] Failed to fetch table rows:`, error);
          return null;
        }
      }

      case "table_row":
        // Table rows are handled by the table block
        return null;

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

    return richText.map((t) => {
      let text = t.plain_text;
      const annotations = t.annotations;

      // Handle links
      const link = t.text?.link?.url || t.href;
      if (link) {
        text = `[${text}](${link})`;
      }

      // Handle formatting (order matters: code innermost)
      if (annotations?.code) {
        text = `\`${text}\``;
      }
      if (annotations?.strikethrough) {
        text = `~~${text}~~`;
      }
      if (annotations?.italic) {
        text = `*${text}*`;
      }
      if (annotations?.bold) {
        text = `**${text}**`;
      }

      return text;
    }).join("");
  }

  async updatePageContent(pageId: string, markdown: string): Promise<void> {
    // First delete all existing blocks (parallel with concurrency limit)
    const existingBlocks = await this.getBlockChildren(pageId);
    const blocksToDelete = existingBlocks.filter(
      (block) => block.type !== "child_page" && block.type !== "child_database"
    );
    
    // Delete blocks in parallel batches of 10
    const DELETE_BATCH_SIZE = 10;
    for (let i = 0; i < blocksToDelete.length; i += DELETE_BATCH_SIZE) {
      const batch = blocksToDelete.slice(i, i + DELETE_BATCH_SIZE);
      await Promise.all(
        batch.map((block) =>
          this.request("DELETE", `/blocks/${block.id}`).catch((error) => {
            console.error("[NotionApiClient] Failed to delete block:", error);
          })
        )
      );
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
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) {
        i++;
        continue;
      }

      // Skip notion-id comment
      if (trimmed.startsWith("<!--") && trimmed.includes("notion-id")) {
        i++;
        continue;
      }

      let block: unknown = null;

      // Handle code blocks
      if (trimmed.startsWith("```")) {
        const language = trimmed.slice(3).trim();
        const codeLines: string[] = [];
        i++;

        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // Skip closing ```

        block = {
          object: "block",
          type: "code",
          code: {
            rich_text: [{ type: "text", text: { content: codeLines.join("\n") } }],
            language: language || "plain text"
          }
        };
      } else if (trimmed.startsWith("### ")) {
        block = {
          object: "block",
          type: "heading_3",
          heading_3: { rich_text: this.parseInlineFormatting(trimmed.slice(4)) }
        };
        i++;
      } else if (trimmed.startsWith("## ")) {
        block = {
          object: "block",
          type: "heading_2",
          heading_2: { rich_text: this.parseInlineFormatting(trimmed.slice(3)) }
        };
        i++;
      } else if (trimmed.startsWith("# ")) {
        block = {
          object: "block",
          type: "heading_1",
          heading_1: { rich_text: this.parseInlineFormatting(trimmed.slice(2)) }
        };
        i++;
      } else if (trimmed.startsWith("- [x] ") || trimmed.startsWith("- [ ] ")) {
        const checked = trimmed.startsWith("- [x] ");
        block = {
          object: "block",
          type: "to_do",
          to_do: {
            rich_text: this.parseInlineFormatting(trimmed.slice(6)),
            checked
          }
        };
        i++;
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        block = {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: { rich_text: this.parseInlineFormatting(trimmed.slice(2)) }
        };
        i++;
      } else if (/^\d+\.\s/.test(trimmed)) {
        const content = trimmed.replace(/^\d+\.\s/, "");
        block = {
          object: "block",
          type: "numbered_list_item",
          numbered_list_item: { rich_text: this.parseInlineFormatting(content) }
        };
        i++;
      } else if (trimmed.startsWith("> ")) {
        block = {
          object: "block",
          type: "quote",
          quote: { rich_text: this.parseInlineFormatting(trimmed.slice(2)) }
        };
        i++;
      } else if (trimmed === "---") {
        block = { object: "block", type: "divider", divider: {} };
        i++;
      } else {
        block = {
          object: "block",
          type: "paragraph",
          paragraph: { rich_text: this.parseInlineFormatting(trimmed) }
        };
        i++;
      }

      if (block) {
        blocks.push(block);
      }
    }

    return blocks;
  }

  private parseInlineFormatting(text: string): unknown[] {
    const richText: unknown[] = [];
    // Regex to match: **bold**, *italic*, `code`, ~~strikethrough~~, [link](url)
    const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|~~(.+?)~~|\[(.+?)\]\((.+?)\))/g;

    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      // Add plain text before this match
      if (match.index > lastIndex) {
        const plainText = text.slice(lastIndex, match.index);
        if (plainText) {
          richText.push({ type: "text", text: { content: plainText } });
        }
      }

      const fullMatch = match[0];

      if (fullMatch.startsWith("**") && fullMatch.endsWith("**")) {
        // Bold
        richText.push({
          type: "text",
          text: { content: match[2] },
          annotations: { bold: true }
        });
      } else if (fullMatch.startsWith("~~") && fullMatch.endsWith("~~")) {
        // Strikethrough
        richText.push({
          type: "text",
          text: { content: match[5] },
          annotations: { strikethrough: true }
        });
      } else if (fullMatch.startsWith("`") && fullMatch.endsWith("`")) {
        // Code
        richText.push({
          type: "text",
          text: { content: match[4] },
          annotations: { code: true }
        });
      } else if (fullMatch.startsWith("[") && fullMatch.includes("](")) {
        // Link
        richText.push({
          type: "text",
          text: { content: match[6], link: { url: match[7] } }
        });
      } else if (fullMatch.startsWith("*") && fullMatch.endsWith("*")) {
        // Italic (check after bold)
        richText.push({
          type: "text",
          text: { content: match[3] },
          annotations: { italic: true }
        });
      }

      lastIndex = match.index + fullMatch.length;
    }

    // Add remaining plain text
    if (lastIndex < text.length) {
      const remaining = text.slice(lastIndex);
      if (remaining) {
        richText.push({ type: "text", text: { content: remaining } });
      }
    }

    // If no formatting found, return simple text
    if (richText.length === 0) {
      return [{ type: "text", text: { content: text } }];
    }

    return richText;
  }
}
