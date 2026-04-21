export type GoogleFontEntry = {
  readonly name: string;
  readonly category: "sans-serif" | "serif" | "monospace";
};

export const POPULAR_GOOGLE_FONTS: GoogleFontEntry[] = [
  { name: "Inter", category: "sans-serif" },
  { name: "Roboto", category: "sans-serif" },
  { name: "Open Sans", category: "sans-serif" },
  { name: "Lato", category: "sans-serif" },
  { name: "Montserrat", category: "sans-serif" },
  { name: "Poppins", category: "sans-serif" },
  { name: "Nunito", category: "sans-serif" },
  { name: "Raleway", category: "sans-serif" },
  { name: "Ubuntu", category: "sans-serif" },
  { name: "Work Sans", category: "sans-serif" },
  { name: "Source Sans 3", category: "sans-serif" },
  { name: "DM Sans", category: "sans-serif" },
  { name: "Playfair Display", category: "serif" },
  { name: "Merriweather", category: "serif" },
  { name: "Lora", category: "serif" },
  { name: "Libre Baskerville", category: "serif" },
  { name: "Source Serif 4", category: "serif" },
  { name: "Fira Code", category: "monospace" },
  { name: "Source Code Pro", category: "monospace" },
  { name: "JetBrains Mono", category: "monospace" },
];

const FONT_NAME_SET = new Set(POPULAR_GOOGLE_FONTS.map((f) => f.name.toLowerCase()));

function firstFamilyFromStack(stack: string): string | null {
  const part = stack.split(",")[0]?.trim().replace(/^["']|["']$/g, "") ?? "";
  return part.length > 0 ? part : null;
}

export function googleFontFamilyFromStack(fontStack: string): string | null {
  const first = firstFamilyFromStack(fontStack);
  if (!first) return null;
  const key = first.toLowerCase();
  if (FONT_NAME_SET.has(key)) return first;
  return null;
}

export function collectGoogleFontFamiliesFromTheme(
  headingFont: string,
  bodyFont: string
): string[] {
  const a = googleFontFamilyFromStack(headingFont);
  const b = googleFontFamilyFromStack(bodyFont);
  const out: string[] = [];
  if (a) out.push(a);
  if (b && b.toLowerCase() !== a?.toLowerCase()) out.push(b);
  return out;
}

const loadedFamilies = new Set<string>();

export function loadGoogleFontsInDocument(families: string[]): void {
  if (typeof document === "undefined") return;
  const next = families.filter((f) => f.trim().length > 0 && !loadedFamilies.has(f));
  if (next.length === 0) return;
  const id = `gf-${next.sort().join("-").replace(/\s+/g, "-").slice(0, 120)}`;
  if (document.getElementById(id)) {
    next.forEach((f) => loadedFamilies.add(f));
    return;
  }
  const params = new URLSearchParams();
  params.set("display", "swap");
  for (const name of next) {
    params.append("family", `${name}:wght@400;500;600;700`);
  }
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${params.toString()}`;
  document.head.appendChild(link);
  next.forEach((f) => loadedFamilies.add(f));
}
