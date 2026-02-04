import { App, Notice, TFile } from "obsidian";
import { execFile } from "child_process";
import { existsSync } from "fs";
import * as path from "path";
import { t } from "./i18n";

function isUrl(str: string): boolean {
  return /^https?:\/\//i.test(str);
}

export function resolveImageAbsolutePath(
  app: App,
  imagePath: string,
  sourcePath: string,
): string | null {
  if (isUrl(imagePath)) {
    return null;
  }

  // Try resolving via Obsidian's link resolution
  const file = app.metadataCache.getFirstLinkpathDest(imagePath, sourcePath);
  if (file instanceof TFile) {
    const basePath = (app.vault.adapter as { getBasePath?: () => string }).getBasePath?.();
    if (basePath) {
      return path.join(basePath, file.path);
    }
  }

  return null;
}

export function openWithDefault(app: App, vaultRelativePath: string): void {
  // openWithDefaultApp exists at runtime but may not be in the type definitions
  (app as unknown as { openWithDefaultApp: (path: string) => void }).openWithDefaultApp(
    vaultRelativePath,
  );
}

export async function openWithCustomProgram(
  programPath: string,
  imageAbsPath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(programPath, [imageAbsPath], (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export async function openImage(
  app: App,
  imagePath: string,
  sourcePath: string,
  customProgramPath: string,
): Promise<void> {
  // Handle external URLs
  if (isUrl(imagePath)) {
    window.open(imagePath);
    return;
  }

  const absPath = resolveImageAbsolutePath(app, imagePath, sourcePath);
  if (!absPath) {
    new Notice(t("imageFileNotFound", { path: imagePath }));
    return;
  }

  // Resolve the vault-relative path for openWithDefaultApp
  const file = app.metadataCache.getFirstLinkpathDest(imagePath, sourcePath);
  if (!file) {
    new Notice(t("imageFileNotFound", { path: imagePath }));
    return;
  }

  if (customProgramPath) {
    if (!existsSync(customProgramPath)) {
      new Notice(t("programNotFound", { path: customProgramPath }));
      return;
    }
    try {
      await openWithCustomProgram(customProgramPath, absPath);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      new Notice(t("failedToOpenImage", { msg }));
    }
  } else {
    openWithDefault(app, file.path);
  }
}
