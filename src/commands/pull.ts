import { Command } from "commander";
import path from "path";
import { AuthService } from "../services/auth.js";
import { ApiService } from "../services/api.js";
import { FileService } from "../services/file.js";
import { Logger } from "../utils/logger.js";

type PullCommandOptions = {
  repoId: string;
  language: string;
  bundleName: string;
  branch?: string;
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

export function createPullCommand(): Command {
  const pullCommand = new Command("pull");

  pullCommand
    .description("Download a translation file from Prismy Hosted (public API)")
    .argument("<filePath>", "Path where to save the translation file (JSON)")
    .requiredOption("--repo-id <id>", "Prismy repository identifier (repo_id)")
    .requiredOption("--language <code>", "Language code (e.g., en-US, fr-FR)")
    .requiredOption("--bundle-name <name>", "Bundle name or ID")
    .option("--branch <branch>", "Target branch name (defaults to repository main branch)")
    .option("--api-token <token>", "API token (overrides PRISMY_API_TOKEN env var)")
    .action(async (filePath: string, options: PullCommandOptions) => {
      try {
        const absolutePath = path.resolve(filePath);
        const apiToken = await resolveApiToken(options.apiToken);

        const apiService = new ApiService(apiToken);
        const translation = await apiService.getTranslationFile({
          repoId: options.repoId,
          language: options.language,
          bundleName: options.bundleName,
          branch: options.branch,
        });

        const content = JSON.stringify(translation, null, 2);
        FileService.writeFileContent(absolutePath, content);

        const keyCount = Object.keys(translation).length;
        Logger.success(`Translation file saved to ${absolutePath}`);
        Logger.info(`Keys: ${keyCount}`);
      } catch (error) {
        Logger.error(`Pull failed: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    });

  return pullCommand;
}
