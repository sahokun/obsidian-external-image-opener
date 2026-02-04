import { getLanguage } from "obsidian";

interface Messages {
  noActiveEditor: string;
  noImageAtCursor: string;
  cannotResolveImagePath: string;
  imageFileNotFound: string;
  failedToOpenImage: string;
  programNotFound: string;
  settingExternalProgramPath: string;
  settingExternalProgramDesc: string;
  settingPlaceholderDefault: string;
}

const en: Messages = {
  noActiveEditor: "No active editor",
  noImageAtCursor: "No image found at cursor position",
  cannotResolveImagePath: "Could not resolve image path",
  imageFileNotFound: "Image file not found: {path}",
  failedToOpenImage: "Failed to open image: {msg}",
  programNotFound: "Program not found: {path}",
  settingExternalProgramPath: "External program path",
  settingExternalProgramDesc:
    "Absolute path to the program for opening images. Leave empty to use the system default." +
    " Example: C:\\Program Files\\IrfanView\\i_view64.exe",
  settingPlaceholderDefault: "System default",
};

const ja: Messages = {
  noActiveEditor: "アクティブなエディタがありません",
  noImageAtCursor: "カーソル位置に画像が見つかりません",
  cannotResolveImagePath: "画像パスを解決できませんでした",
  imageFileNotFound: "画像ファイルが見つかりません: {path}",
  failedToOpenImage: "画像を開けませんでした: {msg}",
  programNotFound: "プログラムが見つかりません: {path}",
  settingExternalProgramPath: "外部プログラムのパス",
  settingExternalProgramDesc:
    "画像を開くプログラムの絶対パスを指定します。空欄の場合、システムのデフォルトアプリで開きます。" +
    " 例: C:\\Program Files\\IrfanView\\i_view64.exe",
  settingPlaceholderDefault: "システムデフォルト",
};

const locales: Record<string, Messages> = { en, ja };

function getMessages(): Messages {
  const lang = getLanguage();
  return locales[lang] ?? en;
}

export function t(key: keyof Messages, vars?: Record<string, string>): string {
  let msg = getMessages()[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      msg = msg.replace(`{${k}}`, v);
    }
  }
  return msg;
}
