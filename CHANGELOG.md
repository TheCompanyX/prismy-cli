# Changelog

## [1.3.0] - 2025-02-18

### Added
- **`prismy push`** – Upload a translation file to Prismy Hosted via the public API. Supports JSON, YAML, and other formats; options for `--repo-id`, `--language`, `--bundle-name`, `--override`, `--branch`, `--user`, `--tags`, `--no-auto-translate`, `--wait-for-translations`.
- **`prismy pull`** – Download a translation file from Prismy Hosted (GET). Writes JSON to the given path (creates or overwrites; parent directories created as needed). Optional `--branch`.
- **CI-friendly auth** – Both commands accept `--api-token` or `PRISMY_API_TOKEN`; in CI they fail fast if no token is provided (no interactive prompt).
- **Documentation** – [PRISMY_PUSH.md](PRISMY_PUSH.md) for push/pull usage, auth, and options; README updated with push/pull section and link.

### Changed
- `FileService.writeFileContent` now creates parent directories when writing (for pull and other writes).

---

## [1.0.0] - 2024-07-04

### Added
- 🎉 **Complete CLI restructure** - Transformed from a single-file script to a professional, modular CLI tool
- 📦 **TypeScript support** - Full TypeScript implementation with proper type safety
- 🎯 **Commander.js integration** - Professional command-line interface with help system
- 🏗️ **Modular architecture** - Organized code into logical modules:
  - `commands/` - Command handlers (auth, generate)
  - `services/` - Business logic (API, Git, File operations, Auth)
  - `utils/` - Shared utilities (Config, Logger)
  - `types/` - TypeScript type definitions
- 🔧 **Enhanced error handling** - Comprehensive error handling with user-friendly messages
- 📚 **Professional documentation** - Complete README with usage examples
- 🔍 **Code quality tools** - ESLint, Prettier, and proper build scripts
- 🔒 **Better security** - Improved API key management and validation

### Changed
- ⚡ **Improved CLI experience** - Clear command structure with help text
- 🎨 **Better logging** - Structured logging with different levels (info, success, warning, error, debug)
- 📁 **File organization** - Clean separation of concerns

### Technical Details
- Converted from JavaScript to TypeScript
- Added proper dependency management
- Implemented build and development scripts
- Added linting and formatting configuration
- Created comprehensive documentation

### Migration
- The CLI maintains the same functionality
- Commands remain the same: `prismy auth` and `prismy generate`
- No breaking changes to existing usage patterns