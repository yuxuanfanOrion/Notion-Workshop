import {
  IHttpClient,
  NotionBlock,
  NotionBlockResponse,
  NotionBlocksResponse
} from "../types";

export class BlocksApi {
  constructor(private readonly client: IHttpClient) {}

  async getBlock(blockId: string): Promise<NotionBlockResponse> {
    return this.client.request<NotionBlockResponse>("GET", `/blocks/${blockId}`);
  }

  async getBlockChildren(blockId: string): Promise<NotionBlock[]> {
    const allBlocks: NotionBlock[] = [];
    let cursor: string | undefined;

    do {
      const params = cursor ? `?start_cursor=${cursor}` : "";
      const response = await this.client.request<NotionBlocksResponse>(
        "GET",
        `/blocks/${blockId}/children${params}`
      );
      allBlocks.push(...response.results);
      cursor = response.has_more ? response.next_cursor : undefined;
    } while (cursor);

    return allBlocks;
  }

  async appendChildren(blockId: string, children: unknown[]): Promise<void> {
    const BATCH_SIZE = 100; // Notion API limit

    for (let i = 0; i < children.length; i += BATCH_SIZE) {
      const batch = children.slice(i, i + BATCH_SIZE);
      await this.client.request("PATCH", `/blocks/${blockId}/children`, {
        children: batch
      });
    }
  }

  async deleteBlock(blockId: string): Promise<void> {
    await this.client.request("DELETE", `/blocks/${blockId}`);
  }

  async deleteBlocksBatch(blockIds: string[], batchSize: number = 10): Promise<void> {
    for (let i = 0; i < blockIds.length; i += batchSize) {
      const batch = blockIds.slice(i, i + batchSize);
      await Promise.all(
        batch.map(id =>
          this.deleteBlock(id).catch(error => {
            console.error("[BlocksApi] Failed to delete block:", error);
          })
        )
      );
    }
  }
}
