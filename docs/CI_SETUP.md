# CI setup: Push & pull translations with Prismy

This guide shows how to run **push** (upload source file and wait for translations) then **pull** (download translated files) in GitHub Actions, GitLab CI, or Bitbucket Pipelines.

## Table of Contents

- [1. General Workflow concept](#1-general-workflow-concept)
- [2. Secrets / variables](#2-secrets--variables)
- [3. GitHub Actions](#3-github-actions)
- [4. GitLab CI](#4-gitlab-ci)
- [5. Bitbucket Pipelines](#5-bitbucket-pipelines)
- [6. Using fixed values (no extra variables)](#6-using-fixed-values-no-extra-variables)
- [7. Optional: run only when i18n files change](#7-optional-run-only-when-i18n-files-change)

## 1. General Workflow concept:

1. Push `src/i18n/en.json` to Prismy and wait for translations to complete.
2. Pull `src/i18n/en.json`, `src/i18n/es.json`, and `src/i18n/fr.json` back from Prismy.

Adjust paths, `--repo-id`, `--bundle-name`, and languages to match your project.

## 2. Secrets / variables

In each platform, define:

| Name               | Description                                      | Secret? |
| ------------------ | ------------------------------------------------ | ------- |
| `PRISMY_API_TOKEN` | API token from your Prismy organization settings | Yes     |

Optional (can be env vars or hardcoded in the config):

- `PRISMY_REPO_ID` – e.g. `25060c5dfa`
- `PRISMY_BUNDLE_NAME` – e.g. `common`

---

## 3. GitHub Actions

**.github/workflows/prismy-sync.yml**

```yaml
name: Prismy sync

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  prismy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install Prismy CLI
        run: npm install -g prismy-cli

      - name: Push source and wait for translations
        env:
          PRISMY_API_TOKEN: ${{ secrets.PRISMY_API_TOKEN }}
        run: |
          prismy push src/i18n/en.json \
            --repo-id "${{ vars.PRISMY_REPO_ID }}" \
            --language en-US \
            --bundle-name "${{ vars.PRISMY_BUNDLE_NAME }}" \
            --wait-for-translations

      - name: Pull translated files
        env:
          PRISMY_API_TOKEN: ${{ secrets.PRISMY_API_TOKEN }}
        run: |
          prismy pull src/i18n/en.json --repo-id "${{ vars.PRISMY_REPO_ID }}" --language en-US --bundle-name "${{ vars.PRISMY_BUNDLE_NAME }}"
          prismy pull src/i18n/es.json --repo-id "${{ vars.PRISMY_REPO_ID }}" --language es-ES --bundle-name "${{ vars.PRISMY_BUNDLE_NAME }}"
          prismy pull src/i18n/fr.json --repo-id "${{ vars.PRISMY_REPO_ID }}" --language fr-FR --bundle-name "${{ vars.PRISMY_BUNDLE_NAME }}"

      - name: Commit and push changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add src/i18n/
          git diff --staged --quiet || git commit -m "chore(i18n): sync translations from Prismy"
          git push
```

**Setup:**

- **Settings → Secrets and variables → Actions**: add secret `PRISMY_API_TOKEN`.
- Optionally add variables `PRISMY_REPO_ID` and `PRISMY_BUNDLE_NAME` (or replace `${{ vars.PRISMY_REPO_ID }}` / `${{ vars.PRISMY_BUNDLE_NAME }}` with your values in the YAML).

## 4. GitLab CI

**.gitlab-ci.yml** (add or merge into your existing config)

```yaml
prismy-sync:
  image: node:20
  rules:
    - if: $CI_PIPELINE_SOURCE == "push" && $CI_COMMIT_BRANCH == "main"
    - if: $CI_PIPELINE_SOURCE == "web"
  variables:
    PRISMY_REPO_ID: "YOUR_REPO_ID" # or use a GitLab CI variable
    PRISMY_BUNDLE_NAME: "common"
  before_script:
    - npm install -g prismy-cli
  script:
    - prismy push src/i18n/en.json
      --repo-id "${PRISMY_REPO_ID}"
      --language en-US
      --bundle-name "${PRISMY_BUNDLE_NAME}"
      --wait-for-translations
    - prismy pull src/i18n/en.json --repo-id "${PRISMY_REPO_ID}" --language en-US --bundle-name "${PRISMY_BUNDLE_NAME}"
    - prismy pull src/i18n/es.json --repo-id "${PRISMY_REPO_ID}" --language es-ES --bundle-name "${PRISMY_BUNDLE_NAME}"
    - prismy pull src/i18n/fr.json --repo-id "${PRISMY_REPO_ID}" --language fr-FR --bundle-name "${PRISMY_BUNDLE_NAME}"
    - |
      git config user.name "GitLab CI"
      git config user.email "ci@gitlab"
      git add src/i18n/
      git diff --staged --quiet || git commit -m "chore(i18n): sync translations from Prismy"
      git push "https://oauth2:${CI_JOB_TOKEN}@${CI_SERVER_HOST}/${CI_PROJECT_PATH}.git" HEAD:${CI_COMMIT_REF_NAME}
```

**Setup:**

- **Settings → CI/CD → Variables**: add `PRISMY_API_TOKEN` as a masked (and protected if needed) variable. The CLI reads it from the environment in CI.
- Set `PRISMY_REPO_ID` (and optionally `PRISMY_BUNDLE_NAME`) in the job `variables` or as CI/CD variables.

**Note:** Pushing back to the repo from GitLab CI usually requires a deploy token or project access token with write rights; adjust the `git push` URL and credentials to match your setup.

## 5. Bitbucket Pipelines

**bitbucket-pipelines.yml**

```yaml
pipelines:
  default:
    - step:
        name: Prismy sync
        image: node:20
        script:
          - npm install -g prismy-cli
          - |
            prismy push src/i18n/en.json \
              --repo-id $PRISMY_REPO_ID \
              --language en-US \
              --bundle-name $PRISMY_BUNDLE_NAME \
              --wait-for-translations
          - prismy pull src/i18n/en.json --repo-id $PRISMY_REPO_ID --language en-US --bundle-name $PRISMY_BUNDLE_NAME
          - prismy pull src/i18n/es.json --repo-id $PRISMY_REPO_ID --language es-ES --bundle-name $PRISMY_BUNDLE_NAME
          - prismy pull src/i18n/fr.json --repo-id $PRISMY_REPO_ID --language fr-FR --bundle-name $PRISMY_BUNDLE_NAME
          - |
            git config user.name "Bitbucket Pipelines"
            git config user.email "pipelines@bitbucket.org"
            git add src/i18n/
            git diff --staged --quiet || git commit -m "chore(i18n): sync translations from Prismy"
            git push origin $BITBUCKET_BRANCH
        variables:
          PRISMY_REPO_ID: $PRISMY_REPO_ID
          PRISMY_BUNDLE_NAME: $PRISMY_BUNDLE_NAME
```

**Setup:**

- **Repository settings → Pipelines → Repository variables**: add `PRISMY_API_TOKEN` (secured). Add `PRISMY_REPO_ID` and `PRISMY_BUNDLE_NAME` (or set them in the step `variables` with literal values).

**Note:** Pushing from Pipelines may require an app password or token; configure it in the step (e.g. via a secured variable) and use it in `git push` if needed.

## 6. Using fixed values (no extra variables)

If you prefer not to use repo/bundle variables, hardcode them in the script. Example for GitHub Actions:

```yaml
- name: Push and wait for translations
  env:
    PRISMY_API_TOKEN: ${{ secrets.PRISMY_API_TOKEN }}
  run: |
    prismy push src/i18n/en.json \
      --repo-id 25060c5dfa \
      --language en-US \
      --bundle-name common \
      --wait-for-translations

- name: Pull translations
  env:
    PRISMY_API_TOKEN: ${{ secrets.PRISMY_API_TOKEN }}
  run: |
    prismy pull src/i18n/en.json --repo-id 25060c5dfa --language en-US --bundle-name common
    prismy pull src/i18n/es.json --repo-id 25060c5dfa --language es-ES --bundle-name common
    prismy pull src/i18n/fr.json --repo-id 25060c5dfa --language fr-FR --bundle-name common
```

Same idea applies to GitLab and Bitbucket: set `PRISMY_REPO_ID` and `PRISMY_BUNDLE_NAME` (or the full flags) directly in the config.

---

## 7. Optional: run only when i18n files change

**GitHub Actions** – trigger only when source translations change:

```yaml
on:
  push:
    branches: [main]
    paths:
      - "src/i18n/en.json"
```

**GitLab CI** – use `rules` with `changes`:

```yaml
rules:
  - if: $CI_COMMIT_BRANCH == "main"
    changes:
      - src/i18n/en.json
```

**Bitbucket** – use path filters in the pipeline definition (Bitbucket UI or `branches`/path filters in the config).

---

For full CLI options (branch, override, tags, etc.), see [PRISMY_PUSH.md](PRISMY_PUSH.md).
