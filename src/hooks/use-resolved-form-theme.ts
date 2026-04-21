"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { FormTheme } from "@/types/form-theme";
import { resolveFormThemeForDisplay } from "@/lib/theme-dark-mode";

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getPrefersDarkSnapshot() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function useResolvedFormTheme(
  theme: FormTheme,
  previewForceDark: boolean | undefined
): FormTheme {
  const prefersDark = useSyncExternalStore(subscribe, getPrefersDarkSnapshot, () => false);
  return useMemo(
    () =>
      resolveFormThemeForDisplay(theme, {
        viewerPrefersDark: prefersDark,
        forceDark: previewForceDark === true ? true : undefined,
      }),
    [theme, prefersDark, previewForceDark]
  );
}
