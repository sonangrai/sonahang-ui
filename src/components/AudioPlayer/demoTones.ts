/*
 * Story-only helper — nothing in the package imports it, so it isn't shipped.
 */

/**
 * Builds a short, quiet WAV tone in the browser so the stories play without
 * shipping a binary or depending on a third-party URL. 8 kHz mono, 8-bit —
 * about 8 KB a second, which is plenty for a demo.
 */
function createToneUrl(seconds: number, frequency = 440) {
  const sampleRate = 8000;
  const samples = Math.floor(seconds * sampleRate);
  const buffer = new ArrayBuffer(44 + samples);
  const view = new DataView(buffer);
  const write = (offset: number, text: string) =>
    [...text].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));

  write(0, "RIFF");
  view.setUint32(4, 36 + samples, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true); // byte rate
  view.setUint16(32, 1, true); // block align
  view.setUint16(34, 8, true); // bits per sample
  write(36, "data");
  view.setUint32(40, samples, true);

  for (let i = 0; i < samples; i++) {
    // A gentle pulse rather than a flat beep, at a fifth of full scale.
    const envelope = 0.5 + 0.5 * Math.sin((2 * Math.PI * i) / sampleRate);
    const sample = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * envelope * 0.2;
    view.setUint8(44 + i, 128 + Math.round(sample * 127));
  }

  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

/**
 * Tones are cached for the life of the page rather than revoked on unmount:
 * there are only a handful, and a revoked URL would break the player when
 * Strict Mode remounts it.
 */
const tones = new Map<string, string>();

export function toneUrl(seconds: number, frequency = 440) {
  const key = `${seconds}:${frequency}`;
  let url = tones.get(key);
  if (!url) {
    url = createToneUrl(seconds, frequency);
    tones.set(key, url);
  }
  return url;
}
