## `prismy push`

Upload a local translation file to Prismy Hosted using the public API.  
Designed to work both locally and in CI.

### Basic usage

```bash
prismy push <filePath> --repo-id <repoId> --language <lang> --bundle-name <bundle>
```

- **`filePath`**: Path to the translation file on disk (JSON, YAML, etc.).
- **`--repo-id`**: Prismy repository identifier (`repo_id` in the API).
- **`--language`**: Language code, e.g. `en-US`, `fr-FR`.
- **`--bundle-name`**: Bundle name or ID, e.g. `common`.

Example:

```bash
prismy push ./locales/en/common.json \
  --repo-id 25060c5dfa \
  --language en-US \
  --bundle-name common
```

### Authentication

The command looks for an API token in this order:

1. `--api-token <token>` (highest priority)
2. `PRISMY_API_TOKEN` environment variable
3. Stored key from `prismy auth` (only when **not** in CI)

#### Local example (CLI flag)

```bash
prismy push ./locales/en/common.json \
  --repo-id 25060c5dfa \
  --language en-US \
  --bundle-name common \
  --api-token YOUR_API_TOKEN
```

#### Local example (stored key)

```bash
# First time
prismy auth YOUR_API_TOKEN

# Then without --api-token
prismy push ./locales/en/common.json \
  --repo-id 25060c5dfa \
  --language en-US \
  --bundle-name common
```

#### CI example (environment variable)

```bash
PRISMY_API_TOKEN=YOUR_API_TOKEN \
prismy push ./locales/en/common.json \
  --repo-id 25060c5dfa \
  --language en-US \
  --bundle-name common
```

> In CI (`CI` env var set), the command **will fail** if neither `--api-token` nor `PRISMY_API_TOKEN` is provided (it will not prompt).

### Options

- `--repo-id <id>` **(required)**: Prismy repository identifier.
- `--language <code>` **(required)**: Language code, e.g. `en-US`.
- `--bundle-name <name>` **(required)**: Bundle name or ID.
- `--api-token <token>`: API token for Prismy Hosted.
- `--override`: If set, completely replaces the file. If omitted, merges new keys only.
- `--no-auto-translate`: Disable automatic translation of new keys to other languages in the bundle.
- `--wait-for-translations`: Wait for translations to complete before returning.
- `--branch <branch>`: Target branch name. If it does not exist, Prismy may create it from main.
- `--user <user>`: Username or email to record as the author of the change.
- `--tags <tags...>`: One or more static tags to apply to newly added/edited keys.

### File formats

`prismy push` supports multiple formats:

- If the file extension is **`.json`**, **`.arb`** or **`.xcstrings`**, the CLI tries to parse it and send it as structured JSON to Prismy.
- For other extensions (e.g. `.yaml`, `.yml`, `.po`, `.resx`, `.xml`, `.ts`, `.js`), the CLI sends the **raw file content** and includes the original format so Prismy can parse it.

You can pass any of these formats as `filePath`; the CLI will handle the correct request body shape for the Prismy Hosted API.

---

## `prismy pull`

Download a translation file from Prismy Hosted (public API).  
The API returns a JSON translation object; the CLI writes it to the path you give.  
Same authentication as `prismy push` (works locally and in CI).

### Basic usage

```bash
prismy pull <filePath> --repo-id <repoId> --language <lang> --bundle-name <bundle>
```

- **`filePath`**: Path where to save the downloaded translation file (JSON).
- **`--repo-id`**: Prismy repository identifier (`repo_id` in the API).
- **`--language`**: Language code, e.g. `en-US`, `fr-FR`.
- **`--bundle-name`**: Bundle name or ID, e.g. `common`.

Example:

```bash
prismy pull ./locales/en/common.json \
  --repo-id 25060c5dfa \
  --language en-US \
  --bundle-name common
```

### Authentication

Same as `prismy push`:

1. `--api-token <token>`
2. `PRISMY_API_TOKEN` environment variable
3. Stored key from `prismy auth` (only when **not** in CI)

#### CI example

```bash
PRISMY_API_TOKEN=YOUR_API_TOKEN \
prismy pull ./locales/en/common.json \
  --repo-id 25060c5dfa \
  --language en-US \
  --bundle-name common
```

### Options

- `--repo-id <id>` **(required)**: Prismy repository identifier.
- `--language <code>` **(required)**: Language code, e.g. `en-US`.
- `--bundle-name <name>` **(required)**: Bundle name or ID.
- `--branch <branch>`: Target branch name. Defaults to the repository main branch.
- `--api-token <token>`: API token for Prismy Hosted.

### Output

The command writes the translation object as pretty-printed JSON to `filePath`.  
The file is **created** if it does not exist, or **overwritten** if it already exists. Parent directories are created as needed.  
If the file does not exist on Prismy, the API returns an empty object `{}`.

**Note:** The Get file API returns only JSON. For other formats (e.g. YAML, PO, RESX), use the CDN hosted version instead; the URL is available in your Prismy Hosted configuration in Prismy.

---

## CI configuration

For ready-to-use pipelines (push source file, wait for translations, then pull translated files) on **GitHub Actions**, **GitLab CI**, or **Bitbucket Pipelines**, see **[CI_SETUP.md](CI_SETUP.md)**.
