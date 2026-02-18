import { Command } from "commander";
import path from "path";
import { AuthService } from "../services/auth.js";
import { ApiService } from "../services/api.js";
import { FileService } from "../services/file.js";
import { Logger } from "../utils/logger.js";

type PushCommandOptions = {
  repoId: string;
  language: string;
  bundleName: string;
  override?: boolean;
  autoTranslate?: boolean;
  waitForTranslations?: boolean;
  branch?: string;
  user?: string;
  tags?: string[];
  apiToken?: string;
};

async function resolveApiToken(optionsToken?: string): Promise<string> {
  const cliToken = optionsToken?.trim();
  if (cliToken) return cliToken;

  const envToken = process.env.PRISMY_API_TOKEN?.trim();
  if (envToken) return envToken;

  if (process.env.CI) {
    throw new Error("Missing API token. Provide --api-token or set PRISMY_API_TOKEN.");
  }

  return await AuthService.getApiKey();
}

export function createPushCommand(): Command {
  const pushCommand = new Command("push");

  pushCommand
    .description("Upload a translation file to Prismy Hosted (public API)")
    .argument("<filePath>", "Path to the translation file to upload")
    .requiredOption("--repo-id <id>", "Prismy repository identifier (repo_id)")
    .requiredOption("--language <code>", "Language code (e.g., en-US, fr-FR)")
    .requiredOption("--bundle-name <name>", "Bundle name or ID")
    .option("--override", "Completely replace the file (default: merge new keys only)", false)
    .option(
      "--wait-for-translations",
      "Wait for translations to complete before responding",
      false
    )
    .option("--branch <branch>", "Target branch name")
    .option("--user <user>", "Username or email to use as author when creating versions")
    .option("--tags <tags...>", "Static tag names to apply to newly added/edited keys")
    .option("--api-token <token>", "API token (overrides PRISMY_API_TOKEN env var)")
    .option(
      "--no-auto-translate",
      "Disable automatic translation of new keys to other languages in the bundle"
    )
    .action(async (filePath: string, options: PushCommandOptions) => {
      try {
        const absolutePath = path.resolve(filePath);
        const apiToken = await resolveApiToken(options.apiToken);

        const requestBody = FileService.buildUpdateTranslationRequestFromFile(
          absolutePath,
          options.tags
        );

        const apiService = new ApiService(apiToken);
        const response = await apiService.updateTranslationFile({
          repoId: options.repoId,
          language: options.language,
          bundleName: options.bundleName,
          override: options.override,
          autoTranslate: options.autoTranslate,
          waitForTranslations: options.waitForTranslations,
          branch: options.branch,
          user: options.user,
          request: requestBody,
        });

        Logger.success(response.message || "Translation file updated successfully");
        if (response.branch) Logger.info(`Branch: ${response.branch}`);
        if (typeof response.total_keys === "number") Logger.info(`Total keys: ${response.total_keys}`);

        if (Array.isArray(response.keys) && response.keys.length > 0) {
          Logger.message("\nUpdated keys:");
          response.keys.forEach((k) => {
            Logger.message(`- ${k.key}${k.updated ? " (updated)" : ""}`);
          });
          Logger.message("");
        }
      } catch (error) {
        Logger.error(`Push failed: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    });

  return pushCommand;
}

