"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export interface NavbarProps {
  readonly left?: React.ReactNode;
  readonly right?: React.ReactNode;
  readonly title?: string;
}

export function Navbar({ left, right, title }: NavbarProps) {
  return (
    <header
      className="flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-safe py-2 shadow-sm sm:min-h-16 sm:gap-4 sm:px-4 sm:py-0 md:px-6 dark:border-[var(--border)]"
      style={{ paddingTop: `max(0.5rem, env(safe-area-inset-top, 0px))` }}
      role="banner"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        {left}
        {title && (
          <h1 className="truncate text-h4 text-[var(--text-primary)]">{title}</h1>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">{right}</div>
    </header>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const isDark = theme === "dark";
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
