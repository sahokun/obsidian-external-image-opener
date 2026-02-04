const WIKILINK_IMAGE_PATTERN = /!\[\[([^\]|]+?)(?:\|[^\]]+?)?\]\]/g;
const MARKDOWN_IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)]+)\)/g;

const IMAGE_EXTENSIONS = new Set([
  "png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "tiff", "tif", "ico", "avif",
]);

export function isImageFile(path: string): boolean {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTENSIONS.has(ext);
}

interface MatchResult {
  path: string;
  start: number;
  end: number;
}

function findWikiLinkImages(line: string): MatchResult[] {
  const results: MatchResult[] = [];
  WIKILINK_IMAGE_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = WIKILINK_IMAGE_PATTERN.exec(line)) !== null) {
    results.push({
      path: match[1].trim(),
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return results;
}

function findMarkdownImages(line: string): MatchResult[] {
  const results: MatchResult[] = [];
  MARKDOWN_IMAGE_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = MARKDOWN_IMAGE_PATTERN.exec(line)) !== null) {
    results.push({
      path: match[2].trim(),
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return results;
}

export function extractImagePathAtCursor(line: string, ch: number): string | null {
  const allMatches = [...findWikiLinkImages(line), ...findMarkdownImages(line)];

  const atCursor = allMatches.find((m) => ch >= m.start && ch <= m.end);
  if (atCursor && isImageFile(atCursor.path)) {
    return atCursor.path;
  }
  return null;
}

export function extractImagePathFromSelection(selection: string): string | null {
  const trimmed = selection.trim();
  if (!trimmed) return null;

  // Check if the selection itself is an image path (e.g., "image.png")
  if (isImageFile(trimmed) && !trimmed.includes("\n")) {
    return trimmed;
  }

  // Check if the selection contains a wiki link or markdown image
  const wikiMatches = findWikiLinkImages(trimmed);
  for (const m of wikiMatches) {
    if (isImageFile(m.path)) return m.path;
  }

  const mdMatches = findMarkdownImages(trimmed);
  for (const m of mdMatches) {
    if (isImageFile(m.path)) return m.path;
  }

  return null;
}
