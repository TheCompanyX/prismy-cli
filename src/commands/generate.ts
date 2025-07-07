import { Command } from "commander";
import { AuthService } from "../services/auth.js";
import { ApiService } from "../services/api.js";
import { GitService } from "../services/git.js";
import { FileService } from "../services/file.js";
import { Logger } from "../utils/logger.js";

export function createGenerateCommand(): Command {
  const generateCommand = new Command("generate");

  generateCommand
    .description("Generate translations for new i18n keys in changed files")
    .option(
      "-b, --base-branch <branch>",
      "Base branch for comparison (defaults to repository main branch)"
    )
    .action(async (options: { baseBranch?: string }) => {
      try {
        Logger.info("Starting translation generation...");

        const gitService = new GitService();
        const apiKey = await AuthService.getApiKey();
        const apiService = new ApiService(apiKey);

        // Get repository information
        const repoName = await gitService.getRepositoryName();
        const currentBranch = await gitService.getCurrentBranch();

        Logger.info(`Repository: ${repoName}`);
        Logger.info(`Current branch: ${currentBranch}`);

        // Get repository configuration
        const repositoryConfig = await apiService.getRepositoryConfig(repoName);

        // Determine base branch
        const baseBranch = options.baseBranch || repositoryConfig.mainBranch;
        Logger.info(`Base branch: ${baseBranch}`);

        // Get changed files
        const changedFiles = await gitService.getChangedFiles(baseBranch);

        if (changedFiles.size === 0) {
          Logger.info("No changed files found. Nothing to translate.");
          return;
        }

        Logger.info(`Found ${changedFiles.size} changed files`);

        // Filter translation bundles to only include those with changed files
        const editedFilesNeedingProcessing = FileService.filterBundlesByChangedFiles(
          repositoryConfig.filesToSync,
          changedFiles
        );

        if (editedFilesNeedingProcessing.length === 0) {
          Logger.info("No translation files need processing.");
          return;
        }

        Logger.info(`Processing ${editedFilesNeedingProcessing.length} translation bundles`);

        // Load file contents
        const bundlesWithContent = FileService.loadFileContents(editedFilesNeedingProcessing);

        // Generate translations
        Logger.info("Generating translations...");
        const translationResponse = await apiService.generateTranslations(
          repoName,
          bundlesWithContent
        );

        if (translationResponse.updatedFiles.length > 0) {
          Logger.message("\n");
        }
        translationResponse.updatedFiles.map((file) => {
          Logger.info(`Updated file: ${file.toPath}`);
          Logger.info(`Added keys:`);
          file.keys.forEach((key) => {
            Logger.info(`- ${key}`);
          });
          Logger.message("\n");
        });

        // Save translated files
        FileService.saveTranslationFiles(translationResponse.files);

        Logger.success("Translation generation completed successfully!");
      } catch (error) {
        Logger.error(
          `Translation generation failed: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    });

  return generateCommand;
}
