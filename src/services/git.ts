import { simpleGit, SimpleGit } from "simple-git";
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

  async getRepositoryName(): Promise<string> {
    try {
      const remotes = await this.git.getRemotes(true);
      const originUrl = remotes.find((remote) => remote.name === "origin")?.refs?.fetch || "";
      const repoName = originUrl.split("/").pop()?.replace(".git", "") || "";

      if (!repoName) {
        throw new Error("Could not determine repository name from remote URL");
      }

      return repoName;
    } catch (error) {
      throw new Error(
        `Failed to get repository name: ${error instanceof Error ? error.message : String(error)}`
      );
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
