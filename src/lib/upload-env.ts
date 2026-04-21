const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;

export function getClientMaxUploadBytes(): number {
  const raw =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_MAX_UPLOAD_BYTES?.trim()
      : undefined;
  if (!raw) return DEFAULT_MAX_BYTES;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_MAX_BYTES;
  return Math.min(n, 50 * 1024 * 1024);
}

export function getGlobalMaxUploadBytes(): number {
  const raw = process.env.MAX_UPLOAD_BYTES?.trim();
  if (!raw) return DEFAULT_MAX_BYTES;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_MAX_BYTES;
  return Math.min(n, 50 * 1024 * 1024);
}

export function getGlobalMimeAllowlist(): Set<string> | null {
  const raw = process.env.ALLOWED_MIME_LIST?.trim();
  if (!raw) return null;
  const parts = raw
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (parts.length === 0) return null;
  return new Set(parts);
}

export function isMimeGloballyAllowed(mime: string, allowlist: Set<string> | null): boolean {
  if (!allowlist) return true;
  const m = mime.toLowerCase();
  return allowlist.has(m);
}
