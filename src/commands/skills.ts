import { Command } from "commander";
import { execSync } from "child_process";

export function createSkillsCommand(): Command {
  const skillsCommand = new Command("skills");

  skillsCommand
    .description("Add Prismy agent skill via npx")
    .action(() => {
      execSync("npx skills add prismy-io/prismy-agent-skill", { stdio: "inherit" });
    });

  return skillsCommand;
}
