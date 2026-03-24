"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Search,
  BookOpen,
  Menu,
  LogOut,
  ClipboardList,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminMobileDrawerProps = {
  readonly userEmail: string;
  readonly onSignOut: () => void;
};

function drawerLinkClass(active: boolean) {
  return cn(
    "flex items-center gap-3 rounded-xl px-4 py-3.5 text-body font-medium transition-colors",
    active
      ? "bg-primary-100 text-primary-800 dark:bg-primary-900/45 dark:text-primary-200"
      : "text-[var(--text-primary)] hover:bg-neutral-100 dark:hover:bg-neutral-800/80"
  );
}

export function AdminMobileDrawer({ userEmail, onSignOut }: AdminMobileDrawerProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="admin-mobile-drawer"
        aria-label="Abrir menu de navegação"
      >
        <Menu className="h-5 w-5" />
      </Button>
      {open ? (
        <div className="fixed inset-0 z-[100] lg:hidden" id="admin-mobile-drawer">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--overlay-scrim)] backdrop-blur-[2px]"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          />
          <nav
            className="scroll-touch absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-[var(--border)] bg-[var(--background)] shadow-2xl dark:border-[var(--border)]"
            style={{
              paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))",
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
            }}
            aria-label="Menu administrativo"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 dark:border-[var(--border)]">
              <span className="text-small font-semibold text-[var(--text-primary)]">Menu</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="hide-scrollbar flex-1 overflow-y-auto px-3 py-4">
              <form action="/admin/search" method="get" className="mb-4">
                <label htmlFor="admin-drawer-search" className="sr-only">
                  Buscar
                </label>
                <div className="flex gap-2">
                  <input
                    id="admin-drawer-search"
                    type="search"
                    name="q"
                    placeholder="Buscar…"
                    className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 dark:border-[var(--border)]"
                  />
                  <Button type="submit" variant="secondary" size="md" aria-label="Buscar">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/admin/forms"
                    className={drawerLinkClass(pathname.startsWith("/admin/forms"))}
                    onClick={() => setOpen(false)}
                  >
                    <ClipboardList className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
                    Formulários
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/dashboards"
                    className={drawerLinkClass(pathname.startsWith("/admin/dashboards"))}
                    onClick={() => setOpen(false)}
                  >
                    <LayoutDashboard className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
                    Dashboards
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/search"
                    className={drawerLinkClass(pathname === "/admin/search")}
                    onClick={() => setOpen(false)}
                  >
                    <Search className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
                    Busca avançada
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tutorial"
                    className={drawerLinkClass(pathname.startsWith("/tutorial"))}
                    onClick={() => setOpen(false)}
                  >
                    <BookOpen className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
                    Tutorial
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className={drawerLinkClass(pathname === "/")}
                    onClick={() => setOpen(false)}
                  >
                    <Home className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
                    Início público
                  </Link>
                </li>
              </ul>
            </div>
            <div className="border-t border-[var(--border)] px-4 py-4 dark:border-[var(--border)]">
              <p className="mb-4 truncate text-caption text-[var(--text-secondary)]" title={userEmail}>
                {userEmail}
              </p>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                size="md"
                onClick={() => {
                  setOpen(false);
                  onSignOut();
                }}
                leftIcon={<LogOut className="h-4 w-4" />}
              >
                Sair
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
