import { describe, expect, it } from "vitest";

import { formatFileSize, isFileAccepted } from "../isFileAccepted";

const file = (name: string, type = "") => new File(["x"], name, { type });

describe("isFileAccepted", () => {
  it("accepts anything when no accept is given", () => {
    expect(isFileAccepted(file("a.exe", "application/x-msdownload"))).toBe(true);
  });

  it("accepts anything when accept is empty", () => {
    expect(isFileAccepted(file("a.exe"), "")).toBe(true);
    expect(isFileAccepted(file("a.exe"), "  ,  ")).toBe(true);
  });

  describe("extensions", () => {
    it("matches by extension", () => {
      expect(isFileAccepted(file("report.pdf", "application/pdf"), ".pdf")).toBe(true);
    });

    it("rejects a different extension", () => {
      expect(isFileAccepted(file("report.docx"), ".pdf")).toBe(false);
    });

    it("is case-insensitive", () => {
      expect(isFileAccepted(file("REPORT.PDF"), ".pdf")).toBe(true);
      expect(isFileAccepted(file("report.pdf"), ".PDF")).toBe(true);
    });

    it("does not match an extension appearing mid-name", () => {
      expect(isFileAccepted(file("pdf-notes.txt"), ".pdf")).toBe(false);
    });
  });

  describe("MIME types", () => {
    it("matches an exact type", () => {
      expect(isFileAccepted(file("data.csv", "text/csv"), "text/csv")).toBe(true);
    });

    it("rejects a different exact type", () => {
      expect(isFileAccepted(file("data.txt", "text/plain"), "text/csv")).toBe(false);
    });

    it("matches a wildcard type", () => {
      expect(isFileAccepted(file("a.png", "image/png"), "image/*")).toBe(true);
      expect(isFileAccepted(file("a.gif", "image/gif"), "image/*")).toBe(true);
    });

    it("rejects a wildcard from another family", () => {
      expect(isFileAccepted(file("a.mp4", "video/mp4"), "image/*")).toBe(false);
    });

    it("is case-insensitive", () => {
      expect(isFileAccepted(file("a.png", "IMAGE/PNG"), "image/*")).toBe(true);
    });
  });

  describe("lists", () => {
    it("accepts a file matching any entry", () => {
      expect(isFileAccepted(file("a.png", "image/png"), ".pdf,image/*")).toBe(true);
      expect(isFileAccepted(file("a.pdf", "application/pdf"), ".pdf,image/*")).toBe(true);
    });

    it("rejects a file matching no entry", () => {
      expect(isFileAccepted(file("a.zip", "application/zip"), ".pdf,image/*")).toBe(false);
    });

    it("tolerates whitespace between entries", () => {
      expect(isFileAccepted(file("a.png", "image/png"), " .pdf , image/* ")).toBe(true);
    });
  });

  it("matches by extension when the browser reports no MIME type", () => {
    // Happens for unusual extensions; the extension is all there is to go on.
    expect(isFileAccepted(file("archive.heic", ""), ".heic")).toBe(true);
    expect(isFileAccepted(file("archive.heic", ""), "image/*")).toBe(false);
  });
});

describe("formatFileSize", () => {
  it("reports bytes below 1 KB", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1023)).toBe("1023 B");
  });

  it("steps up through the units", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1024 * 1024)).toBe("1 MB");
    expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
  });

  it("keeps one decimal place", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });

  it("drops a trailing .0", () => {
    expect(formatFileSize(2048)).toBe("2 KB");
  });

  it("stops at the largest unit", () => {
    expect(formatFileSize(1024 ** 5)).toBe("1024 TB");
  });
});
