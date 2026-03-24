import fetch from "node-fetch";
import fetchWithTaskPolling from "../utils/fetchWithTaskPolling.js";
import {
  RepositoryConfig,
  TranslationBundle,
  TranslationApiResponse,
  TranslationObject,
  UpdateTranslationRequest,
  UpdateTranslationResponse,
  GlossaryTerm,
  GlossaryTermForLang,
  AiInstructionsResponse,
} from "../types/index.js";
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

  async updateTranslationFile(params: {
    repoId: string;
    language: string;
    bundleName: string;
    override?: boolean;
    autoTranslate?: boolean;
    waitForTranslations?: boolean;
    branch?: string;
    user?: string;
    request: UpdateTranslationRequest;
  }): Promise<UpdateTranslationResponse> {
    const {
      repoId,
      language,
      bundleName,
      override,
      autoTranslate,
      waitForTranslations,
      branch,
      user,
      request,
    } = params;

    try {
      const query = new URLSearchParams();
      if (typeof override === "boolean") query.set("override", String(override));
      if (typeof autoTranslate === "boolean") query.set("auto-translate", String(autoTranslate));
      if (typeof waitForTranslations === "boolean") {
        query.set("wait-for-translations", String(waitForTranslations));
      }
      if (branch) query.set("branch", branch);
      if (user) query.set("user", user);

      const endpointPath = `/public/prismy-hosted/${encodeURIComponent(repoId)}/${encodeURIComponent(
        language
      )}/${encodeURIComponent(bundleName)}`;
      const url = `${this.baseUrl}${endpointPath}${query.toString() ? `?${query}` : ""}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": `prismy-cli/${CLI_VERSION}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        let errorMessage = response.statusText;
        try {
          const responseText = await response.text();
          const errorBody = JSON.parse(responseText) as { error?: string; message?: string };
          errorMessage = errorBody.message || errorBody.error || errorMessage;
        } catch {
          // ignore parse errors
        }
        throw new Error(`Push API request failed: ${response.status} ${errorMessage}`);
      }

      const result = (await response.json()) as UpdateTranslationResponse;
      Logger.debug("Push response received", result);
      return result;
    } catch (error) {
      throw new Error(
        `Failed to update translation file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getTranslationFile(params: {
    repoId: string;
    language: string;
    bundleName: string;
    branch?: string;
  }): Promise<TranslationObject> {
    const { repoId, language, bundleName, branch } = params;
    try {
      const query = new URLSearchParams();
      if (branch) query.set("branch", branch);
      const endpointPath = `/public/prismy-hosted/${encodeURIComponent(repoId)}/${encodeURIComponent(
        language
      )}/${encodeURIComponent(bundleName)}`;
      const url = `${this.baseUrl}${endpointPath}${query.toString() ? `?${query}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
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
          const errorBody = JSON.parse(responseText) as { error?: string; message?: string };
          errorMessage = errorBody.message || errorBody.error || errorMessage;
        } catch {
          // ignore parse errors
        }
        throw new Error(`Pull API request failed: ${response.status} ${errorMessage}`);
      }

      const result = (await response.json()) as TranslationObject;
      Logger.debug("Pull response received", result);
      return result;
    } catch (error) {
      throw new Error(
        `Failed to get translation file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getGlossary(): Promise<GlossaryTerm[]>;
  async getGlossary(lang: string): Promise<GlossaryTermForLang[]>;
  async getGlossary(lang?: string): Promise<GlossaryTerm[] | GlossaryTermForLang[]> {
    try {
      const endpoint = lang
        ? `/public/glossary/${encodeURIComponent(lang)}`
        : `/public/glossary`;

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
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
          const errorBody = JSON.parse(responseText) as { error?: string; message?: string };
          errorMessage = errorBody.message || errorBody.error || errorMessage;
        } catch {
          // ignore parse errors
        }
        throw new Error(`Glossary API request failed: ${response.status} ${errorMessage}`);
      }

      const result = await response.json();
      Logger.debug("Glossary response received", result);
      return result as GlossaryTerm[] | GlossaryTermForLang[];
    } catch (error) {
      throw new Error(
        `Failed to get glossary: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getAiInstructions(lang?: string): Promise<AiInstructionsResponse> {
    try {
      const endpoint = lang
        ? `/public/ai-instructions/${encodeURIComponent(lang)}`
        : `/public/ai-instructions`;

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
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
          const errorBody = JSON.parse(responseText) as { error?: string; message?: string };
          errorMessage = errorBody.message || errorBody.error || errorMessage;
        } catch {
          // ignore parse errors
        }
        throw new Error(`AI Instructions API request failed: ${response.status} ${errorMessage}`);
      }

      const result = (await response.json()) as AiInstructionsResponse;
      Logger.debug("AI Instructions response received", result);
      return result;
    } catch (error) {
      throw new Error(
        `Failed to get AI instructions: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
