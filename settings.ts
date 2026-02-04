import { App, PluginSettingTab, Setting } from "obsidian";
import type OpenImageExternallyPlugin from "./main";
import { t } from "./i18n";

export interface OpenImageExternallySettings {
  customProgramPath: string;
}

export const DEFAULT_SETTINGS: OpenImageExternallySettings = {
  customProgramPath: "",
};

export class OpenImageExternallySettingTab extends PluginSettingTab {
  plugin: OpenImageExternallyPlugin;

  constructor(app: App, plugin: OpenImageExternallyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName(t("settingExternalProgramPath"))
      .setDesc(t("settingExternalProgramDesc"))
      .addText((text) =>
        text
          .setPlaceholder(t("settingPlaceholderDefault"))
          .setValue(this.plugin.settings.customProgramPath)
          .onChange(async (value) => {
            this.plugin.settings.customProgramPath = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
