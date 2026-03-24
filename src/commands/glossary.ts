import { Command } from "commander";
import { AuthService } from "../services/auth.js";
import { ApiService } from "../services/api.js";
import { Logger } from "../utils/logger.js";

type GlossaryCommandOptions = {
  language?: string;
  apiToken?: string;
};

export function createGlossaryCommand(): Command {
  const glossaryCommand = new Command("glossary");

  glossaryCommand
    .description("List glossary terms from Prismy")
    .option("--language <code>", "Language code (e.g., en-US, fr-FR)")
    .option("--api-token <token>", "API token (overrides PRISMY_API_TOKEN env var)")
    .action(async (options: GlossaryCommandOptions) => {
      try {
        const apiToken = await AuthService.resolveApiToken(options.apiToken);
        const apiService = new ApiService(apiToken);

        if (options.language) {
          const terms = await apiService.getGlossary(options.language);
          Logger.success(`Found ${terms.length} glossary terms for ${options.language}\n`);
          for (const t of terms) {
            const desc = t.description || "—";
            Logger.message(`  ${t.term} — ${desc}`);
          }
        } else {
          const terms = await apiService.getGlossary();
          Logger.success(`Found ${terms.length} glossary terms\n`);
          for (const t of terms) {
            const desc = t.description || "—";
            const langs = Object.entries(t.terms)
              .map(([lang, v]) => `${lang}: ${v.value}`)
              .join(", ");
            Logger.message(`  ${desc}`);
            Logger.message(`    ${langs}\n`);
          }
        }
      } catch (error) {
        Logger.error(`Glossary failed: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    });

  return glossaryCommand;
}
