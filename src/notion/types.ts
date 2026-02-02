// Notion API type definitions

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

export interface NotionRichText {
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

export interface NotionPropertyValue {
  type?: string;
  title?: NotionRichText[];
}

export interface NotionPageProperties {
  [key: string]: NotionPropertyValue | undefined;
}

export interface NotionPageResponse {
  id: string;
  properties?: NotionPageProperties;
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

export interface NotionSearchResponse {
  results: NotionPageResponse[];
  has_more: boolean;
  next_cursor?: string;
}

export interface NotionBlockResponse {
  id: string;
  type: string;
  child_page?: {
    title: string;
  };
}

export interface NotionBlocksResponse {
  results: NotionBlock[];
  has_more: boolean;
  next_cursor?: string;
}

// Error types
export class NotionApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly body?: string
  ) {
    super(message);
    this.name = "NotionApiError";
  }
}

export class NotionRateLimitError extends NotionApiError {
  constructor(
    public readonly retryAfter: number,
    body?: string
  ) {
    super(`Rate limited. Retry after ${retryAfter} seconds`, 429, body);
    this.name = "NotionRateLimitError";
  }
}

// Interfaces for dependency injection
export interface TokenProvider {
  getToken(): Promise<string | undefined>;
}

export interface IHttpClient {
  request<T>(method: string, endpoint: string, body?: unknown): Promise<T>;
}

export interface ICache {
  get<T>(key: string): T | undefined;
  set(key: string, value: unknown, ttl?: number): void;
  delete(key: string): void;
  clear(): void;
}
