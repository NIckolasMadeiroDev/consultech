import { describe, it, expect } from "vitest";
import { sniffMimeFromBuffer } from "./file-type-sniff";

describe("sniffMimeFromBuffer", () => {
  it("deteta PDF", () => {
    const buf = Buffer.from("%PDF-1.4\n", "utf8");
    expect(sniffMimeFromBuffer(buf)).toBe("application/pdf");
  });

  it("deteta PNG", () => {
    const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(sniffMimeFromBuffer(buf)).toBe("image/png");
  });
});
