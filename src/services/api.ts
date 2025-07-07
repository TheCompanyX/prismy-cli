import fetch from "node-fetch";
import fetchWithTaskPolling from "../utils/fetchWithTaskPolling.js";
import { RepositoryConfig, TranslationBundle, TranslationApiResponse } from "../types/index.js";
import { Logger } from "../utils/logger.js";

export class ApiService {
  private readonly baseUrl = "http://app.prismy.io/api";

  constructor(private apiKey: string) {}

  async getRepositoryConfig(repoName: string): Promise<RepositoryConfig> {
    try {
      const response = await fetch(`${this.baseUrl}/config?repo=${repoName}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const config = (await response.json()) as RepositoryConfig;
      Logger.debug("Repository config received", config);

      return config;
    } catch (error) {
      throw new Error(
        `Failed to fetch repository config: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async generateTranslations(
    repositoryName: string,
    files: TranslationBundle[]
  ): Promise<TranslationApiResponse> {
    try {
      const response = await fetchWithTaskPolling(
        this.baseUrl,
        `/cli/generate-translations`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ repositoryName, files }),
        },
        async (partialResponse) => {
          if (partialResponse.ok) {
            const partialResult = await partialResponse.json();
            Logger.message(
              `🔍 Found ${partialResult.keysToTranslate.length} new keys to translate`
            );
            Logger.info("Translating...");
          }
        }
      );

      if (!response.ok) {
        let errorMessage = response.statusText;
        try {
          const errorBody = (await response.json()) as { message?: string };
          errorMessage = errorBody.message || errorMessage;
        } catch {
          // If parsing fails, will use statusText as fallback (assigned above)
        }
        throw new Error(`Translation API request failed: ${response.status} ${errorMessage}`);
      }

      const result = (await response.json()) as TranslationApiResponse;
      Logger.debug("Translation response received", result);

      return result;
    } catch (error) {
      throw new Error(
        `Failed to generate translations: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
