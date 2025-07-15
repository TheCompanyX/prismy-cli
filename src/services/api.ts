import fetch from "node-fetch";
import fetchWithTaskPolling from "../utils/fetchWithTaskPolling.js";
import { RepositoryConfig, TranslationBundle, TranslationApiResponse } from "../types/index.js";
import { Logger } from "../utils/logger.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, "../../package.json"), "utf-8"));
const CLI_VERSION = packageJson.version;

export class ApiService {
  private readonly baseUrl = "https://app.prismy.io/api";

  constructor(private apiKey: string) {}

  async getRepositoryConfig(repoName: string): Promise<RepositoryConfig> {
    try {
      const response = await fetch(`${this.baseUrl}/config?repo=${repoName}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": `prismy-cli/${CLI_VERSION}`,
        },
      });

      if (!response.ok) {
        let errorMessage = response.statusText;
        try {
          const responseText = await response.text();
          const errorBody = JSON.parse(responseText) as {
            data?: { message?: string };
            message?: string;
          };
          errorMessage = errorBody.data?.message || errorBody.message || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, use statusText as fallback
        }
        throw new Error(`API request failed: ${response.status} ${errorMessage}`);
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
    files: TranslationBundle[],
    baseBranch: string
  ): Promise<TranslationApiResponse> {
    try {
      const response = await fetchWithTaskPolling(
        this.baseUrl,
        `/cli/generate-translations`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "User-Agent": `prismy-cli/${CLI_VERSION}`,
          },
          method: "POST",
          body: JSON.stringify({ repositoryName, files, baseBranch }),
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
          const responseText = await response.text();
          const errorBody = JSON.parse(responseText) as {
            data?: { message?: string };
            message?: string;
          };
          errorMessage = errorBody.data?.message || errorBody.message || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, use statusText as fallback
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
