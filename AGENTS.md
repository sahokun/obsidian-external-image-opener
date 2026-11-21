# External Image Opener

<!-- Working rules for this repository, for both AI agents (Claude Code, Codex, etc.) and people.
     Rewrite the "Project-specific" section per project; keep the "Common rules" section identical across all of sahokun's repositories. -->

## Project-specific

### Overview

An Obsidian plugin that opens images in notes with external programs, via keyboard shortcuts or button clicks.
It is distributed through GitHub Releases for Obsidian users on desktop and mobile.

### Tech stack and layout

- TypeScript (strict), bundled by esbuild into a single `main.js`. The Obsidian API and CodeMirror modules are externals and are not bundled.
- All source modules live at the repository root:
  - `main.ts`: plugin entry point. Extends `Plugin`, registers commands, the editor context menu, the reading-mode click handler, and the ribbon icon, and calls the other modules.
  - `image-path-extractor.ts`: regex-based detection of image references at the cursor or in the selection, validated against supported extensions (PNG, JPG, GIF, WebP, SVG, BMP, TIFF, ICO, AVIF).
  - `image-opener.ts`: resolves vault-relative paths to absolute paths with `metadataCache.getFirstLinkpathDest()`, opens images with `child_process.execFile()` for a custom program or falls back to Obsidian's default app opener, and handles HTTP/HTTPS URLs separately.
  - `i18n.ts`: simple English/Japanese translations with `{path}` and `{msg}` interpolation. The language follows Obsidian's settings.
  - `settings.ts`: a single setting, `customProgramPath` (empty string means the system default).
- Key patterns:
  - Images in reading mode use `app://` URLs, which are decoded and matched against vault files to get absolute paths.
  - Errors surface as Obsidian `Notice` dialogs instead of thrown exceptions.
  - External programs are launched with `execFile()`, not `exec()`, to prevent command injection.

### Verification

```bash
npm ci
npm run build    # tsc type check + esbuild production bundle
```

- There is no test suite or linter. TypeScript strict mode (`noImplicitAny`, `strictNullChecks`, `noUnusedLocals`) provides compile-time validation.
- `npm run dev` rebuilds on file changes during development.

### Releases

- Bump the version when plugin source files (`*.ts`, etc.) change. Workflow-only or documentation-only changes do not need a bump.
- Steps:
  1. Run `npm run bump -- <new-version>` to update `manifest.json`, `versions.json`, `package.json`, and `package-lock.json` together, and merge the change into main through a PR.
  2. Push a tag with `git tag v<version>` and `git push origin v<version>`. `release.yml` publishes the artifacts to GitHub Releases (pushing to main alone does not release).

## Common rules

### Branches and PRs

<!-- branch-model:begin -->
- The default branch is `main`. Work on a branch and open a PR into `main`.
- PRs are squash-merged. Each PR leaves a single commit on main, titled with the PR title only.
<!-- branch-model:end -->
- Write PR titles in Conventional Commits form (`feat: ...`, `fix: ...`, etc.) so the change is clear from one line.
- Merged branches are deleted automatically.

### Never put these in history or anything published

- Do not write email addresses, tokens, passwords, details of a personal environment, or links to AI agent sessions in commits, PRs, issues, or comments.
  - Work-branch commits and PRs stay on GitHub after merging, and even the owner cannot delete them. Rewriting main's history needs a force push and a request to GitHub Support. Only PR descriptions can be fixed later by editing.
- Commit with your GitHub noreply address (`<ID>+<username>@users.noreply.github.com`) as the author email.
- Do not commit `.env`, key files, or local settings (`.claude/settings.local.json`, etc.).

### Dependencies

- Only add or update to versions published at least 7 days ago. Hijacked or swapped releases are often discovered shortly after publication.
  - Dependabot version updates wait 7 days via `cooldown`. For npm, `min-release-age=7` in `.npmrc` applies the same limit to manual updates.
- Pin GitHub Actions to a full 40-character commit SHA and keep the version as a trailing comment (e.g. `actions/checkout@<SHA> # v7.0.1`). Tags can be moved.
- Treat Dependabot PRs as a signal that updates exist. Merge them once CI passes, and for major updates, after reviewing the changes.
