# Prismy CLI

The Prismy CLI provides commands for managing translations, tailored to different integration setups with Prismy.

[Prismy](https://www.prismy.io) helps teams ship localized softwares, webapps and app faster with tailored AI translations, great developer experience and great tools for reviewers to make wording changes easy.

## Commands

| Command | Description |
|---------|-------------|
| `prismy generate` | Generate translations for new i18n keys in changed files |
| `prismy push` | Upload a translation file to Prismy |
| `prismy pull` | Download a translation file from Prismy |
| `prismy skills` | Generate wording guidelines skill for Claude Code or Cursor |
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

### 3. AI Wording Guidelines

Use **`prismy skills`** to generate a `SKILL.md` file containing your glossary and AI instructions from Prismy. This file is automatically picked up by AI coding tools like Claude Code and Cursor, giving them context about your approved terminology and tone of voice.

```bash
# Interactive — choose where to save (Claude Code, Cursor, or both)
prismy skills

# Force refresh
prismy skills --force

# Specify language
prismy skills --language fr-FR

# CI mode — writes directly to a path
prismy skills --output .claude/skills/prismy-wording-guidelines/SKILL.md
```

You can also inspect your Prismy data directly:

```bash
# List all glossary terms
prismy glossary

# List glossary for a specific language
prismy glossary --language fr-FR

# View AI translation instructions
prismy ai-instructions
```
