/**
 * Removes the indentation a template literal picks up from the code around it.
 *
 * Blank first and last lines go first — a template literal almost always opens
 * with the newline after the backtick and closes with the indentation before
 * it — then the smallest indent shared by every remaining non-blank line is
 * stripped from all of them. Relative indentation inside the block survives.
 *
 * Indentation is counted in characters, so a block mixing tabs and spaces at
 * the same depth won't line up. Pick one.
 */
export function dedentCode(source: string): string {
  const lines = source.replace(/\r\n/g, "\n").split("\n");

  while (lines.length > 0 && lines[0].trim() === "") lines.shift();
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
  if (lines.length === 0) return "";

  // Blank lines are skipped: a stray empty line would drag the shared indent
  // to zero and dedent nothing.
  const indents = lines
    .filter((line) => line.trim() !== "")
    .map((line) => line.length - line.trimStart().length);

  const shared = Math.min(...indents);

  return lines.map((line) => line.slice(shared)).join("\n");
}
