import { Command } from "commander";
import { AuthService } from "../services/auth.js";
import { Logger } from "../utils/logger.js";

export function createAuthCommand(): Command {
  const authCommand = new Command("auth");

  authCommand
    .description("Manage Prismy API key")
    .argument("[api-key]", "Your Prismy API key")
    .option("--show", "Show current API key")
    .option("--reset", "Reset stored API key")
    .action(async (apiKey?: string, options?: { show?: boolean; reset?: boolean }) => {
      try {
        if (options?.reset) {
          AuthService.resetApiKey();
          return;
        }

        if (options?.show) {
          AuthService.showApiKey();
          return;
        }

        if (apiKey) {
          AuthService.setApiKey(apiKey);
          return;
        }

        // If no arguments provided, show current key
        AuthService.showApiKey();
      } catch (error) {
        Logger.error(
          `Authentication failed: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    });

  return authCommand;
}
