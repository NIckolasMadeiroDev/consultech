function parseYoutube(u: URL): string | null {
  const host = u.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = u.pathname.replace(/^\//, "").split("/")[0];
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
    const m = u.pathname.match(/^\/embed\/([^/?]+)/);
    if (m?.[1]) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
    const s = u.pathname.match(/^\/shorts\/([^/?]+)/);
    if (s?.[1]) return `https://www.youtube-nocookie.com/embed/${s[1]}`;
  }
  return null;
}

function parseVimeo(u: URL): string | null {
  const host = u.hostname.replace(/^www\./, "");
  if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;
  const m = u.pathname.match(/\/(?:video\/)?(\d+)/);
  return m?.[1] ? `https://player.vimeo.com/video/${m[1]}` : null;
}

export function isEmbeddableVideoPageUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    return Boolean(parseYoutube(u) || parseVimeo(u));
  } catch {
    return false;
  }
}

export function toVideoEmbedSrc(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    return parseYoutube(u) ?? parseVimeo(u);
  } catch {
    return null;
  }
}
