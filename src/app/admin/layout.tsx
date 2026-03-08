"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, Home, Search } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Navbar, ThemeToggle } from "@/components/layout";
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
            className="text-h4 font-semibold text-[var(--text-primary)] hover:text-primary-600 dark:hover:text-primary-400"
          >
            Consultech Admin
          </Link>
        }
        right={
          <>
            <form action="/admin/search" method="get" className="flex items-center gap-1">
              <input
                type="search"
                name="q"
                placeholder="Buscar..."
                className="h-9 w-28 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-small text-[var(--text-primary)] outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 sm:w-40"
              />
              <Button type="submit" variant="secondary" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <Link
              href="/admin/forms"
              className="hidden text-small text-[var(--text-secondary)] hover:text-[var(--text-primary)] sm:inline"
            >
              Formulários
            </Link>
            <Link
              href="/admin/dashboards"
              className="hidden items-center gap-2 text-small text-[var(--text-secondary)] hover:text-[var(--text-primary)] sm:inline-flex"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboards
            </Link>
            <span className="hidden max-w-[140px] truncate text-caption text-[var(--text-secondary)] sm:inline">
              {user.email}
            </span>
            <ThemeToggle />
            <Button variant="secondary" size="sm" onClick={handleSignOut}>
              Sair
            </Button>
            <Link href="/" className="hidden sm:inline">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4" />
                Início
              </Button>
            </Link>
          </>
        }
      />
      <main className="flex-1 p-md sm:p-lg">
        <div className="mx-auto max-w-content">{children}</div>
      </main>
    </div>
  );
}
