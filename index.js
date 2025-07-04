#!/usr/bin/env node

const simpleGit = require("simple-git");
const git = simpleGit();
const [, , baseBranch = "main"] = process.argv;

(async () => {
  try {
    console.log(
      `\n🔍 Listing files changed locally OR on branch vs ${baseBranch}:\n`
    );

    const status = await git.status();

    // Local edits: not added (untracked), modified (unstaged), staged
    const localFiles = new Set([
      ...status.not_added,
      ...status.modified,
      ...status.staged,
      ...status.created,
      ...status.deleted,
      ...status.renamed.map((r) => r.to),
    ]);

    // Diff with base branch
    const branchDiffRaw = await git.diff([`${baseBranch}...`, "--name-only"]);
    const branchFiles = branchDiffRaw
      .trim()
      .split("\n")
      .filter((f) => f);

    branchFiles.forEach((f) => localFiles.add(f));

    if (localFiles.size === 0) {
      console.log("✅ No local or branch changes found.");
    } else {
      [...localFiles].sort().forEach((f) => console.log(` - ${f}`));
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
})();
