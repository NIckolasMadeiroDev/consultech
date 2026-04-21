const MAX_LEN = 180;

export function sanitizeFilenameForStorage(name: string): string {
  const base = name.replace(/[/\\?%*:|"<>]/g, "_").replace(/\s+/g, " ").trim();
  if (base.length <= MAX_LEN) return base || "file";
  const ext = base.includes(".") ? base.slice(base.lastIndexOf(".")) : "";
  const stem = base.slice(0, MAX_LEN - ext.length);
  return (stem + ext).slice(0, MAX_LEN);
}
