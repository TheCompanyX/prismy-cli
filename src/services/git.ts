import { simpleGit, SimpleGit } from "simple-git";
import { input } from "@inquirer/prompts";
import { Logger } from "../utils/logger.js";

export class GitService {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  async getCurrentBranch(): Promise<string> {
    try {
      const branch = await this.git.branch();
      return branch.current;
    } catch (error) {
      throw new Error(
        `Failed to get current branch: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getRepositoryName(overrideName?: string): Promise<string> {
    if (overrideName) {
      return overrideName;
    }
    try {
      const remotes = await this.git.getRemotes(true);
      const originUrl = remotes.find((remote) => remote.name === "origin")?.refs?.fetch || "";
      const repoName = originUrl.split("/").pop()?.replace(".git", "") || "";

      if (!repoName) {
        Logger.warning("Could not determine repository name from remote URL");
        const manualRepoName = await input({
          message: "Please enter the repository name:",
          validate: (input) => {
            if (!input || input.trim().length === 0) {
              return "Repository name cannot be empty";
            }
            return true;
          }
        });
        return manualRepoName.trim();
      }

      return repoName;
    } catch (error) {
      Logger.warning(`Failed to get repository name: ${error instanceof Error ? error.message : String(error)}`);
      const manualRepoName = await input({
        message: "Please enter the repository name:",
        validate: (input) => {
          if (!input || input.trim().length === 0) {
            return "Repository name cannot be empty";
          }
          return true;
        }
      });
      return manualRepoName.trim();
    }
  }

  async getChangedFiles(baseBranch: string): Promise<Set<string>> {
    try {
      const status = await this.git.status();

      // Local changes
      const localFiles = new Set([
        ...status.not_added,
        ...status.modified,
        ...status.staged,
        ...status.created,
        ...status.deleted,
        ...status.renamed.map((r) => r.to),
      ]);

      // Branch diff
      const branchDiffRaw = await this.git.diff([`${baseBranch}...`, "--name-only"]);
      const branchFiles = branchDiffRaw
        .trim()
        .split("\n")
        .filter((f) => f);

      branchFiles.forEach((file) => localFiles.add(file));

      Logger.debug(`Found ${localFiles.size} changed files`, Array.from(localFiles));

      return localFiles;
    } catch (error) {
      throw new Error(
        `Failed to get changed files: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
