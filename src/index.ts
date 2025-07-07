#!/usr/bin/env node
import { Command } from "commander";
import { createAuthCommand, createGenerateCommand } from "./commands/index.js";
import { Logger } from "./utils/logger.js";

const program = new Command();

program
  .name("prismy")
  .description("CLI tool to generate translations for new i18n keys in your git branch")
  .version("1.0.0");

// Add commands
program.addCommand(createAuthCommand());
program.addCommand(createGenerateCommand());

// Default command - run generate
program
  .argument("[options...]", "Options to pass to generate command")
  .action(async (options: string[]) => {
    try {
      // If no command specified, run generate
      if (process.argv.length === 2) {
        await createGenerateCommand().parseAsync(["generate"], { from: "user" });
      } else {
        // Parse remaining arguments as generate command
        await createGenerateCommand().parseAsync(["generate", ...options], { from: "user" });
      }
    } catch (error) {
      Logger.error(`Command failed: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();
