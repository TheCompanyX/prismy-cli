#!/usr/bin/env node
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { createAuthCommand, createGenerateCommand, createPullCommand, createPushCommand } from "./commands/index.js";
import { Logger } from "./utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const pkgPath = path.resolve(__dirname, "..", "package.json");
let version = "0.0.0";
try {
  const pkg = require(pkgPath) as { version?: string };
  if (typeof pkg?.version === "string") version = pkg.version;
} catch {
  // ignore
}

const program = new Command();

program
  .name("prismy")
  .description("CLI tool to generate translations for new i18n keys in your git branch")
  .version(version);

// Add commands
program.addCommand(createAuthCommand());
program.addCommand(createGenerateCommand());
program.addCommand(createPullCommand());
program.addCommand(createPushCommand());

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
