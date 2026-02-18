# Prismy CLI

A powerful CLI tool that automatically generates translations for new i18n keys in your git branch. Perfect for maintaining multilingual applications without manual translation overhead.

## Features

- 🔍 **Smart Detection**: Automatically detects new translation keys in your current branch or local changes
- 🌐 **Multi-language Support**: Generates translations for all configured languages
- 🔧 **Git Integration**: Seamlessly works with your git workflow
- ⚡ **Fast Processing**: Only processes files that have actually changed
- 🔐 **Secure**: API key management with local storage
- 📤 **Push / Pull**: Upload or download translation files via the Prismy Hosted API (CI-friendly)

## Installation

```bash
npm install -g prismy-cli
```

## Quick Start

1. **Set up your API key:**
```bash
prismy auth your-api-key-here
```

2. **Generate translations for your changes:**
```bash
prismy generate
```

That's it! The CLI will automatically detect new translation keys in your changed files and generate translations for all configured languages.

## Usage

### Authentication

```bash
# Set API key
prismy auth <your-api-key>

# Show current API key
prismy auth --show

# Reset stored API key
prismy auth --reset
```

### Generate Translations

```bash
# Generate translations for changes in current branch
prismy generate

# Use a custom base branch for comparison
prismy generate --base-branch feature/my-feature

# Specify repository name manually (useful when git remote detection fails)
prismy generate --repo-name my-project

# Combine options
prismy generate --base-branch main --repo-name my-project

# Short forms
prismy generate -b main -r my-project
```

### Push & Pull (Prismy Hosted)

Upload or download translation files using the Prismy Hosted public API. Works in CI with `--api-token` or `PRISMY_API_TOKEN`.

```bash
# Push a local translation file
prismy push ./locales/en.json --repo-id <id> --language en-US --bundle-name common

# Pull a translation file (saved as JSON)
prismy pull ./locales/en.json --repo-id <id> --language en-US --bundle-name common
```

**Full documentation:** [docs/PRISMY_PUSH.md](docs/PRISMY_PUSH.md) — options, authentication, file formats, and CI usage.

### Default Behavior

When you run `prismy` without any commands, it defaults to `prismy generate`:

```bash
# These are equivalent
prismy
prismy generate
```

## How It Works

1. **Repository Analysis**: Connects to your repository and fetches translation configuration
2. **Change Detection**: Compares your current branch with the base branch to find modified files
3. **File Processing**: Identifies translation files that contain new keys
4. **Translation Generation**: Sends new keys to the Prismy API for translation
5. **File Updates**: Automatically updates your translation files with the new translations

## Configuration

The CLI automatically fetches configuration from your repository, including:
- Main branch name
- Translation files to sync
- Supported languages
- File structure

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

## Debug Mode

Enable debug logging to see detailed information:

```bash
DEBUG=1 prismy generate
```

## Error Handling

The CLI provides clear error messages for common issues:

- **No API key**: Prompts you to set up authentication
- **No repository config**: Ensures your repository is properly configured
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

## Development

### Building from Source

```bash
# Clone the repository
git clone <repository-url>
cd prismy-cli

# Install dependencies
npm install

# Build the project
npm run build

# Run locally
npm start
```

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode for development
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC

## Support

If you encounter any issues or have questions, please open an issue in the repository.