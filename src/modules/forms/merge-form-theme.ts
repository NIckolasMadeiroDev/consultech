import { DEFAULT_FORM_THEME } from "@/types/form-theme-defaults";
import type { FormTheme } from "@/types/form-theme";

function isPlainRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function mergeSection<T extends Record<string, unknown>>(base: T, patch: unknown): T {
  if (!isPlainRecord(patch)) return base;
  const out = { ...base } as Record<string, unknown>;
  for (const k of Object.keys(patch)) {
    const pv = patch[k];
    const bv = out[k];
    if (isPlainRecord(bv) && isPlainRecord(pv)) {
      out[k] = mergeSection(bv, pv);
    } else if (bv === undefined && isPlainRecord(pv)) {
      out[k] = mergeSection({}, pv);
    } else if (pv !== undefined) {
      out[k] = pv;
    }
  }
  return out as T;
}

export function mergeFormTheme(base: FormTheme, patch: unknown): FormTheme {
  if (!isPlainRecord(patch)) return base;
  return mergeSection(base as unknown as Record<string, unknown>, patch) as unknown as FormTheme;
}

export function parseFormThemeFromJson(raw: unknown): FormTheme {
  return mergeFormTheme(DEFAULT_FORM_THEME, raw);
}
