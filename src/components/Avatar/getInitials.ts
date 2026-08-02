/**
 * "Ada Lovelace" -> "AL", "Ada" -> "A", "Ada B. Lovelace" -> "AL".
 * Returns "" for names with no word characters, so callers can fall
 * through to the placeholder icon.
 */
export function getInitials(name: string, max = 2): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "";

  const picked = words.length > max ? [words[0], words[words.length - 1]] : words;

  return picked
    .slice(0, max)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}
