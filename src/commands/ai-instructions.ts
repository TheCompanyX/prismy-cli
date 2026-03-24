import { Command } from "commander";
import { AuthService } from "../services/auth.js";
import { ApiService } from "../services/api.js";
import { Logger } from "../utils/logger.js";

type AiInstructionsCommandOptions = {
  language?: string;
  apiToken?: string;
};

export function createAiInstructionsCommand(): Command {
  const aiInstructionsCommand = new Command("ai-instructions");

  aiInstructionsCommand
    .description("List AI translation instructions from Prismy")
    .option("--language <code>", "Language code (e.g., en-US, fr-FR)")
    .option("--api-token <token>", "API token (overrides PRISMY_API_TOKEN env var)")
    .action(async (options: AiInstructionsCommandOptions) => {
      try {
        const apiToken = await AuthService.resolveApiToken(options.apiToken);
        const apiService = new ApiService(apiToken);

        const result = await apiService.getAiInstructions(options.language);

        Logger.success(`AI Instructions for ${result.language}\n`);

        if (result.orgDescription) {
          Logger.message("Organization description:");
          Logger.message(`  ${result.orgDescription}\n`);
        }

        if (result.instructions.length === 0) {
          Logger.info("No AI instructions configured.");
        } else {
          Logger.message(`Instructions (${result.instructions.length}):`);
          for (let i = 0; i < result.instructions.length; i++) {
            const instr = result.instructions[i];
            Logger.message(`  ${i + 1}. ${instr.prompt}`);
            const scope = [
              `Source: ${instr.source}`,
              instr.repository ? `Repository: ${instr.repository}` : null,
              instr.bundle ? `Bundle: ${instr.bundle}` : null,
            ]
              .filter(Boolean)
              .join(" | ");
            Logger.message(`     ${scope}`);
          }
        }
      } catch (error) {
        Logger.error(
          `AI Instructions failed: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    });

  return aiInstructionsCommand;
}
