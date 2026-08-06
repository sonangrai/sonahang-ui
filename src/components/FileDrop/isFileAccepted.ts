/**
 * Matches a file against an `accept` string (the same syntax as the `accept`
 * attribute: ".pdf,image/*,text/csv").
 *
 * The browser applies `accept` to the file picker, but **not** to drag-and-drop
 * — dropped files arrive unfiltered — so this runs on both paths to keep them
 * behaving the same.
 */
export function isFileAccepted(file: File, accept?: string): boolean {
  if (!accept) return true;

  const patterns = accept
    .split(",")
    .map((pattern) => pattern.trim().toLowerCase())
    .filter(Boolean);

  if (patterns.length === 0) return true;

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return patterns.some((pattern) => {
    // Extension: ".pdf"
    if (pattern.startsWith(".")) return name.endsWith(pattern);
    // Wildcard MIME: "image/*" — compare against the "image/" prefix.
    if (pattern.endsWith("/*")) return type.startsWith(pattern.slice(0, -1));
    // Exact MIME: "text/csv"
    return type === pattern;
  });
}

/** "1.4 MB" — for listing the files a user has picked. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }

  // One decimal place, but no trailing ".0".
  const rounded = Math.round(size * 10) / 10;
  return `${rounded} ${units[unit]}`;
}
