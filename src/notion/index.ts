// Public exports
export {
  NotionBlock,
  NotionPageInfo,
  NotionRootPage,
  NotionRichText,
  NotionPageResponse,
  NotionApiError,
  NotionRateLimitError,
  TokenProvider,
  IHttpClient,
  ICache
} from "./types";

export { NotionHttpClient } from "./client";
export { LRUCache } from "./cache";
export { BlocksApi } from "./api/blocks";
export { PagesApi } from "./api/pages";
export { SearchApi } from "./api/search";
export { blocksToMarkdown } from "./converters/blockToMarkdown";
export { markdownToBlocks } from "./converters/markdownToBlock";
export { richTextToMarkdown, parseInlineFormatting } from "./converters/richText";

// Re-export the facade class
export { NotionApiClient } from "./facade";
