/**
 * Formats a playback position as `m:ss`, or `h:mm:ss` once it passes an hour.
 *
 * Anything that isn't a finite, non-negative number comes back as `--:--`.
 * That covers the `NaN` a media element reports before its metadata loads and
 * the `Infinity` it reports for a live stream — neither has a length to show.
 */
export function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--";

  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = String(total % 60).padStart(2, "0");

  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${secs}`;
  return `${minutes}:${secs}`;
}
