import { describe, it, expect } from "vitest";
import { isEmbeddableVideoPageUrl, toVideoEmbedSrc } from "./video-embed-url";

describe("video-embed-url", () => {
  it("aceita YouTube watch e devolve embed", () => {
    const u = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    expect(isEmbeddableVideoPageUrl(u)).toBe(true);
    expect(toVideoEmbedSrc(u)).toContain("youtube-nocookie.com/embed/");
  });

  it("aceita Vimeo e devolve player", () => {
    const u = "https://vimeo.com/148751763";
    expect(isEmbeddableVideoPageUrl(u)).toBe(true);
    expect(toVideoEmbedSrc(u)).toContain("player.vimeo.com/video/");
  });

  it("rejeita URL arbitrária", () => {
    expect(isEmbeddableVideoPageUrl("https://example.com/video")).toBe(false);
  });
});
