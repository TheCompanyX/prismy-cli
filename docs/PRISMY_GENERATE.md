# Prismy Generate (GitHub & GitLab Integration)

The `prismy generate` command is designed for teams using Prismy's native GitHub or GitLab integrations. When you have Prismy integrated with your repository, Prismy automatically syncs translation files and triggers translations via PR comments. The `generate` command allows you to generate translations locally during development.

## When to Use

- ✅ You have Prismy integrated with GitHub or GitLab
- ✅ Prismy automatically syncs your translation files
- ✅ You want to generate translations locally before committing
- ✅ You're working on a feature branch and want to preview translations

## When NOT to Use

- ❌ If you're using **Prismy Hosted** without native integrations → use [`prismy push` and `prismy pull`](PRISMY_PUSH_PULL_CI.md) instead
- ❌ If you need to manually sync files → use [`prismy push` and `prismy pull`](PRISMY_PUSH_PULL_CI.md) instead

## How It Works

1. **Repository Analysis**: Connects to your repository and fetches translation configuration
2. **Change Detection**: Compares your current branch with the base branch to find modified files
3. **File Processing**: Identifies translation files that contain new keys
4. **Translation Generation**: Sends new keys to the Prismy API for translation
5. **File Updates**: Automatically updates your translation files with the new translations

## Installation

```bash
npm install -g prismy-cli
```

## Authentication

First setup your API key first: (you can generate an API Key from [Prismy's Settings](https://app.prismy.io/settings))

```bash
# Set API key
prismy auth <your-api-key>

# Show current API key
prismy auth --show

# Reset stored API key
prismy auth --reset
```

## Basic Usage

```bash
# Generate translations for changes in current branch
prismy generate
```

The CLI automatically:

- Detects your repository from git remotes
- Compares your current branch with the main branch
- Finds new translation keys in changed files
- Generates translations for all configured languages
- Updates your local translation files

## Options

### `--base-branch <branch>` / `-b <branch>`

Specify a custom base branch for comparison. Defaults to your repository's main branch.

```bash
# Compare against develop branch
prismy generate --base-branch develop

# Short form
prismy generate -b develop
```

**Use case**: When working on feature branches that should be compared against `develop` instead of `main`.

### `--repo-name <name>` / `-r <name>`

Manually specify the repository name. Useful when git remote detection fails.

```bash
# Specify repository name manually
prismy generate --repo-name my-project

# Short form
prismy generate -r my-project
```

**Use case**: When git remotes aren't configured or don't follow standard patterns.

### Combining Options

```bash
prismy generate --base-branch develop --repo-name my-project

# Short forms
prismy generate -b develop -r my-project
```

## Default Behavior

When you run `prismy` without any commands, it defaults to `prismy generate`:

```bash
# These are equivalent
prismy
prismy generate
```

## Examples

### Basic Workflow

```bash
# 1. Make changes to your code that include new translation keys
git checkout -b feature/new-translations

# 2. Generate translations for your changes
prismy generate

# 3. Review and commit the generated translations
git add .
git commit -m "Add translations for new features"
```

### Working with Feature Branches

```bash
# Compare against a different base branch
prismy generate --base-branch develop

# This is useful when working on feature branches
# that should be compared against develop instead of main
```

## Configuration

The CLI automatically fetches configuration from your repository, including:

- Main branch name
- Translation files to sync
- Supported languages
- File structure

No manual configuration needed! The CLI reads everything from your Prismy repository settings.

## Debug Mode

Enable debug logging to see detailed information:

```bash
DEBUG=1 prismy generate
```

## Error Handling

The CLI provides clear error messages for common issues:

- **No API key**: Prompts you to set up authentication with `prismy auth`
- **No repository config**: Ensures your repository is properly configured in Prismy
- **API errors**: Clear messages about API connectivity issues
- **File errors**: Warnings about missing or inaccessible files

### Repository Detection Issues

If the CLI cannot automatically detect your repository name from the git remote, you have two options:

1. **Interactive prompt**: The CLI will ask you to enter the repository name manually
2. **Command line option**: Use `--repo-name` to specify it directly

```bash
# When auto-detection fails, specify manually
prismy generate --repo-name my-project-name
```

This is particularly useful in environments where:

- Git remotes are not configured
- Repository URLs don't follow standard patterns
- You're working with local-only repositories

## Integration with GitHub/GitLab Workflow

When using Prismy's native GitHub or GitLab integration:

1. **During Development**: Use `prismy generate` locally to preview translations
2. **In Pull Requests**: Prismy automatically detects missing translations and comments on PRs
3. **Translation Workflow**:
   - Prismy syncs files automatically
   - Missing translations are detected via CI checks
   - Translations can be triggered via PR comments
   - No need to manually push/pull files

The `generate` command complements this workflow by allowing local translation generation during development, while Prismy handles the rest automatically in your CI/CD pipeline.
