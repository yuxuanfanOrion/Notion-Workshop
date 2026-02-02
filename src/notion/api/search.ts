import { IHttpClient, NotionSearchResponse, NotionPageResponse } from "../types";

export interface SearchOptions {
  query?: string;
  filter?: {
    property: string;
    value: string;
  };
  sort?: {
    direction: "ascending" | "descending";
    timestamp: "last_edited_time" | "created_time";
  };
  pageSize?: number;
}

export class SearchApi {
  constructor(private readonly client: IHttpClient) {}

  async search(options: SearchOptions = {}): Promise<NotionPageResponse[]> {
    const allResults: NotionPageResponse[] = [];
    let cursor: string | undefined;

    do {
      const response = await this.client.request<NotionSearchResponse>("POST", "/search", {
        query: options.query,
        filter: options.filter,
        sort: options.sort,
        start_cursor: cursor,
        page_size: options.pageSize ?? 50
      });
      allResults.push(...response.results);
      cursor = response.has_more ? response.next_cursor : undefined;
    } while (cursor);

    return allResults;
  }

  async searchPages(query?: string): Promise<NotionPageResponse[]> {
    return this.search({
      query,
      filter: { property: "object", value: "page" }
    });
  }
}
