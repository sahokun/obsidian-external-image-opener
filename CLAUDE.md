# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

Think in English, respond in Japanese.

## Build Commands

```bash
npm run dev      # Development build with file watching
npm run build    # Production build (tsc type check + esbuild bundle)
```

No test suite or linter is configured. TypeScript strict mode (`noImplicitAny`, `strictNullChecks`, `noUnusedLocals`) provides compile-time validation.

Output is a single `main.js` bundled by esbuild. Obsidian API and CodeMirror modules are externals (not bundled).

## Architecture

Four source modules, all at the project root:

- **main.ts** — Plugin entry point. Extends `Plugin`, registers commands, editor context menu, reading mode click handler, and ribbon icon. Orchestrates calls to the other modules.
- **image-path-extractor.ts** — Regex-based detection of image references at cursor position or in selection. Validates against supported image extensions (PNG, JPG, GIF, WebP, SVG, BMP, TIFF, ICO, AVIF).
- **image-opener.ts** — Resolves vault-relative paths to absolute filesystem paths using Obsidian's `metadataCache.getFirstLinkpathDest()`. Opens images via `child_process.execFile()` for custom programs or falls back to Obsidian's default app opener. Handles HTTP/HTTPS URLs separately.
- **i18n.ts** — Simple translation system (English/Japanese) with variable interpolation (`{path}`, `{msg}`). Language detected from Obsidian settings.
- **settings.ts** — Single setting: `customProgramPath` (empty string = system default). Settings UI via `PluginSettingTab`.

## Key Patterns

- **Path resolution in reading mode**: Images use `app://` URLs that must be decoded and matched against vault files to get absolute paths.
- **Error handling**: All errors surface as Obsidian `Notice` dialogs rather than thrown exceptions.
- **Security**: Uses `execFile()` (not `exec()`) to prevent command injection when launching external programs.

## Git Workflow

- Feature branches use the `feature/<name>` format, created from **main**
- Direct push and force push to main are prohibited
- Claude's scope of work is limited to pushing to feature branches

### PR Flow (handled by humans)
- PRs are created and merged by humans
- If Copilot's automated review leaves comments, Claude fixes them and pushes to the same feature branch
- Thread resolution and final merge are done by humans

### Release Procedure

#### When to bump the version

| Change type | Version bump |
|---|---|
| Changes to plugin source files (`*.ts`, etc.) | **Required** |
| CI workflow changes only (`.github/workflows/`) | Not required |
| Documentation changes only (`README.md`, `CLAUDE.md`) | Not required |

#### Steps

1. Bump version in one command (`manifest.json`, `versions.json`, `package.json`, `package-lock.json` are all updated):
   ```bash
   npm run bump -- <new-version>
   # Example: npm run bump -- 1.0.1
   ```
2. Commit and merge into main
3. Push a tag to trigger release.yml, which publishes artifacts to GitHub Releases:
   ```bash
   git tag v<version>
   git push origin v<version>
   ```

> The release workflow is triggered only by tag pushes. Pushing to main alone does not trigger a release.
