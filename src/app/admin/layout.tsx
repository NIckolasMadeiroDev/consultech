"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, Home, Search, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Navbar, ThemeToggle, AdminMobileDrawer } from "@/components/layout";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  async function handleSignOut() {
    await signOut();
    toast("Você saiu. Até logo!", "info");
    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface)]">
        <p className="text-body text-[var(--text-secondary)]">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar
        left={
          <Link
            href="/admin/forms"
            className="truncate text-base font-semibold text-[var(--text-primary)] hover:text-primary-600 sm:text-h4 dark:hover:text-primary-400"
          >
            <span className="sm:hidden">Consultech</span>
            <span className="hidden sm:inline">Consultech Admin</span>
          </Link>
        }
        right={
          <>
            <div className="hidden items-center gap-2 lg:flex lg:flex-wrap lg:justify-end">
              <form action="/admin/search" method="get" className="flex items-center gap-1">
                <input
                  type="search"
                  name="q"
                  placeholder="Buscar…"
                  className="h-10 min-h-10 w-36 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-small text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 xl:w-44 dark:border-[var(--border)]"
                />
                <Button type="submit" variant="secondary" size="sm" aria-label="Buscar">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              <Link
                href="/admin/forms"
                className="text-small text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Formulários
              </Link>
              <Link
                href="/admin/dashboards"
                className="inline-flex items-center gap-2 text-small text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboards
              </Link>
              <Link
                href="/tutorial"
                className="inline-flex items-center gap-2 text-small text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Ver tutorial do sistema"
              >
                <BookOpen className="h-4 w-4" />
                Tutorial
              </Link>
              <span className="max-w-[160px] truncate text-caption text-[var(--text-secondary)]" title={user.email}>
                {user.email}
              </span>
              <ThemeToggle />
              <Button variant="secondary" size="sm" onClick={handleSignOut}>
                Sair
              </Button>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4" />
                  Início
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-1 lg:hidden">
              <AdminMobileDrawer userEmail={user.email} onSignOut={handleSignOut} />
              <ThemeToggle />
              <Button variant="secondary" size="sm" onClick={handleSignOut} className="px-2 sm:px-3">
                Sair
              </Button>
            </div>
          </>
        }
      />
      <main className="flex-1 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        <div className="mx-auto w-full max-w-content">{children}</div>
      </main>
    </div>
  );
}
