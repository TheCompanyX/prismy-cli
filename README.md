# Prismy CLI

The Prismy CLI provides commands for managing translations, tailored to different integration setups with Prismy.

[Prismy](https://www.prismy.io) helps teams ship localized softwares, webapps and app faster with tailored AI translations, great developer experience and great tools for reviewers to make wording changes easy.

## Commands

| Command | Description |
|---------|-------------|
| `prismy generate` | Generate translations for new i18n keys in changed files |
| `prismy push` | Upload a translation file to Prismy |
| `prismy pull` | Download a translation file from Prismy |
| `prismy skills` | Install the Prismy agent skill into your AI coding tools |
| `prismy glossary` | List glossary terms from Prismy |
| `prismy ai-instructions` | List AI translation instructions |
| `prismy auth` | Manage your Prismy API key |

## Use Cases

### 1. GitHub/GitLab Integration

If you've integrated Prismy with GitHub or GitLab, Prismy automatically syncs your translation files and triggers translations via PR comments. Use **`prismy generate`** to generate translations locally during development.

👉 **[Learn more about `prismy generate` →](docs/PRISMY_GENERATE.md)**

---

### 2. Prismy Hosted (No Native Integration)

If you're using Prismy Hosted without native GitHub/GitLab integrations, you'll need to manually sync translation files. Use **`prismy pull`** and **`prismy push`** to upload and download translations.

👉 **[Learn more about `prismy push` and `prismy pull` →](docs/PRISMY_PUSH_PULL_CI.md)**

---

### 3. AI Agent Skill

Use **`prismy skills`** to install the [Prismy agent skill](https://github.com/prismy-io/prismy-agent-skill) into your AI coding tools (Claude Code, Cursor, Copilot, and more). The skill gives your AI assistant context about your project's approved terminology, tone of voice, and translation workflows.

```bash
prismy skills
```

