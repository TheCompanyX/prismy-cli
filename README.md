# Prismy CLI

The Prismy CLI provides commands for managing translations, tailored to different integration setups with Prismy.

[Prismy](prismy.io) helps teams ship localized softwares, webapps and app faster with tailored AI translations, great developer experience and great tools for reviewers to make wording changes easy.

## Two Main Use Cases:

### 1. GitHub/GitLab Integration

If you've integrated Prismy with GitHub or GitLab, Prismy automatically syncs your translation files and triggers translations via PR comments. Use **`prismy generate`** to generate translations locally during development.

👉 **[Learn more about `prismy generate` →](docs/PRISMY_GENERATE.md)**

---

### 2. Prismy Hosted (No Native Integration)

If you're using Prismy Hosted without native GitHub/GitLab integrations, you'll need to manually sync translation files. Use **`prismy pull`** and **`prismy push`** to upload and download translations.

👉 **[Learn more about `prismy push` and `prismy pull` →](docs/PRISMY_PUSH_PULL_CI.md)**
