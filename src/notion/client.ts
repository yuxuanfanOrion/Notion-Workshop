import {
  IHttpClient,
  ICache,
  TokenProvider,
  NotionApiError,
  NotionRateLimitError
} from "./types";
import { LRUCache } from "./cache";

export interface HttpClientOptions {
  baseUrl?: string;
  apiVersion?: string;
  maxRetries?: number;
  timeout?: number;
  cache?: ICache;
}

export class NotionHttpClient implements IHttpClient {
  private readonly baseUrl: string;
  private readonly apiVersion: string;
  private readonly maxRetries: number;
  private readonly timeout: number;
  private readonly cache: ICache;

  constructor(
    private readonly tokenProvider: TokenProvider,
    options: HttpClientOptions = {}
  ) {
    this.baseUrl = options.baseUrl ?? "https://api.notion.com/v1";
    this.apiVersion = options.apiVersion ?? "2022-06-28";
    this.maxRetries = options.maxRetries ?? 3;
    this.timeout = options.timeout ?? 30000;
    this.cache = options.cache ?? new LRUCache();
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await this.tokenProvider.getToken();
    if (!token) {
      throw new Error("Notion Token not configured");
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": this.apiVersion
    };
  }

  async request<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
    // Only cache GET requests
    const cacheKey = method === "GET" ? `${method}:${endpoint}` : "";
    if (cacheKey) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached !== undefined) {
        return cached;
      }
    }

    const headers = await this.getHeaders();
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text();

          // Handle rate limiting
          if (response.status === 429) {
            const retryAfter = parseInt(response.headers.get("Retry-After") || "1", 10);
            const error = new NotionRateLimitError(retryAfter, errorBody);

            if (attempt < this.maxRetries) {
              console.warn(`[NotionHttpClient] Rate limited, waiting ${retryAfter}s before retry`);
              await this.sleep(retryAfter * 1000);
              continue;
            }
            throw error;
          }

          // Retry on 5xx errors
          if (response.status >= 500 && attempt < this.maxRetries) {
            console.warn(`[NotionHttpClient] Server error ${response.status}, retrying...`);
            await this.sleep(1000 * attempt);
            continue;
          }

          throw new NotionApiError(
            `Notion API error: ${response.status} - ${errorBody}`,
            response.status,
            errorBody
          );
        }

        const result = (await response.json()) as T;

        if (cacheKey) {
          this.cache.set(cacheKey, result);
        }

        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error as Error;

        // Don't retry on API errors (except rate limit and 5xx handled above)
        if (lastError instanceof NotionApiError) {
          throw lastError;
        }

        console.warn(
          `[NotionHttpClient] Attempt ${attempt}/${this.maxRetries} failed:`,
          lastError.message
        );

        if (attempt < this.maxRetries) {
          await this.sleep(1000 * attempt);
        }
      }
    }

    throw new Error(`Network error after ${this.maxRetries} retries: ${lastError?.message}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clearCache(): void {
    this.cache.clear();
  }
}
