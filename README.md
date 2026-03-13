# Open Image Externally

An [Obsidian](https://obsidian.md/) plugin that opens images in external programs directly from your notes.

## Features

- **Command palette**: "Open image at cursor in external program"
- **Context menu**: Right-click on an image reference in the editor
- **Ctrl+Click**: Click images in reading mode while holding Ctrl
- **Ribbon icon**: Click the image icon in the left sidebar
- Supports WikiLink (`![[image.png]]`) and Markdown (`![alt](url)`) image formats
- Optionally specify a custom image viewer (e.g., IrfanView, GIMP, Photoshop)
- Falls back to system default application when no custom program is set
- UI displayed in Japanese or English based on your Obsidian language setting

## Installation

1. Download `main.js` and `manifest.json` from the
   [latest release](https://github.com/sahokun/obsidian-external-image-opener/releases/latest)
2. Create a folder: `<vault>/.obsidian/plugins/open-image-externally/`
3. Copy the downloaded files into that folder
4. Restart Obsidian and enable the plugin in **Settings** > **Community plugins**

## Usage

### Open from Editor (Source / Live Preview)

1. Place the cursor on an image reference:
   - `![[photo.png]]`
   - `![description](path/to/image.jpg)`
2. Run the command **"Open image at cursor in external program"**
   from the command palette, or right-click and select
   **"Open image externally"** from the context menu.

### Open from Reading Mode

Hold **Ctrl** and click on any image in reading mode.

### Ribbon Icon

Click the image icon in the left sidebar to open the image at the current cursor position.

## Settings

| Setting | Description |
|---------|-------------|
| **External program path** | Absolute path to your preferred image viewer. Leave empty to use the system default application. |

**Example paths:**

- Windows: `C:\Program Files\IrfanView\i_view64.exe`
- macOS: `/Applications/Preview.app/Contents/MacOS/Preview`
- Linux: `/usr/bin/gimp`

## Supported Image Formats

png, jpg, jpeg, gif, webp, svg, bmp, tiff, tif, ico, avif

## Requirements

- Obsidian v1.8.7 or later
- Desktop only (not available on mobile)

## License

[MIT](LICENSE)
