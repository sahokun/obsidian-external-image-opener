import { Editor, MarkdownFileInfo, MarkdownView, Notice, Plugin } from "obsidian";
import { extractImagePathAtCursor, extractImagePathFromSelection, isImageFile } from "./image-path-extractor";
import { openImage } from "./image-opener";
import {
  DEFAULT_SETTINGS,
  OpenImageExternallySettingTab,
  type OpenImageExternallySettings,
} from "./settings";
import { t } from "./i18n";

export default class OpenImageExternallyPlugin extends Plugin {
  settings: OpenImageExternallySettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new OpenImageExternallySettingTab(this.app, this));

    // Command: open image at cursor
    this.addCommand({
      id: "open-image-externally",
      name: "Open image at cursor in external program",
      editorCallback: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
        if (ctx instanceof MarkdownView) {
          this.handleOpenImageFromEditor(editor, ctx);
        }
      },
    });

    // Context menu: add "Open image externally" item
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu, editor, info) => {
        const imagePath = this.getImagePathFromEditor(editor);
        if (imagePath) {
          menu.addItem((item) => {
            item
              .setTitle("Open image externally")
              .setIcon("external-link")
              .onClick(() => {
                if (info instanceof MarkdownView) {
                  this.handleOpenImageFromEditor(editor, info);
                }
              });
          });
        }
      }),
    );

    // Reading mode: Ctrl+Click on images
    this.registerDomEvent(document, "click", (evt: MouseEvent) => {
      if (!evt.ctrlKey) return;

      if (!(evt.target instanceof HTMLElement)) return;
      const target = evt.target;
      if (target.tagName !== "IMG") return;

      const imgEl = target as HTMLImageElement;
      const src = imgEl.getAttribute("src") ?? imgEl.getAttribute("data-src") ?? "";
      if (!src) return;

      evt.preventDefault();
      this.handleOpenImageFromReadingMode(src);
    });

    // Ribbon icon
    this.addRibbonIcon("image", "Open image externally", () => {
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!view) {
        new Notice(t("noActiveEditor"));
        return;
      }
      this.handleOpenImageFromEditor(view.editor, view);
    });
  }

  private getImagePathFromEditor(editor: Editor): string | null {
    const selection = editor.getSelection();
    if (selection) {
      return extractImagePathFromSelection(selection);
    }
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    return extractImagePathAtCursor(line, cursor.ch);
  }

  private handleOpenImageFromEditor(editor: Editor, view: MarkdownView): void {
    const imagePath = this.getImagePathFromEditor(editor);
    if (!imagePath) {
      new Notice(t("noImageAtCursor"));
      return;
    }
    const sourcePath = view.file?.path ?? "";
    openImage(this.app, imagePath, sourcePath, this.settings.customProgramPath);
  }

  private handleOpenImageFromReadingMode(src: string): void {
    const activeFile = this.app.workspace.getActiveFile();
    const sourcePath = activeFile?.path ?? "";

    // Convert Obsidian resource URL to vault-relative path
    const vaultPath = this.extractVaultPathFromSrc(src);
    if (vaultPath) {
      openImage(this.app, vaultPath, sourcePath, this.settings.customProgramPath);
    } else if (/^https?:\/\//i.test(src)) {
      window.open(src);
    } else {
      new Notice(t("cannotResolveImagePath"));
    }
  }

  private extractVaultPathFromSrc(src: string): string | null {
    // Obsidian encodes vault images as app://local/... URLs
    // Try to decode and find the file in the vault
    try {
      const decoded = decodeURIComponent(src);

      // Check if it's an app:// URL (Obsidian internal)
      if (decoded.startsWith("app://")) {
        const basePath = (
          this.app.vault.adapter as { getBasePath?: () => string }
        ).getBasePath?.();
        if (basePath) {
          const normalizedBase = basePath.replace(/\\/g, "/");
          const idx = decoded.indexOf(normalizedBase);
          if (idx !== -1) {
            const relative = decoded.substring(idx + normalizedBase.length + 1);
            // Remove query string if present
            const clean = relative.split("?")[0];
            return clean;
          }
        }
      }

      // Try matching against vault files directly
      const files = this.app.vault.getFiles();
      for (const file of files) {
        if (!isImageFile(file.path)) continue;
        if (
          decoded.endsWith(file.path) ||
          decoded.endsWith("/" + file.path) ||
          decoded.endsWith(file.name) ||
          decoded.endsWith("/" + file.name)
        ) {
          return file.path;
        }
      }
    } catch (e) {
      console.error("Failed to extract vault path from src:", e);
    }

    return null;
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
