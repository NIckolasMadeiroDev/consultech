"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  FolderTree,
  CreditCard,
  BarChart3,
  FileText,
  MessageCircle,
  X,
  Send,
  FileSignature,
  Target,
  Calendar,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout";
import { cn } from "@/lib/utils";
import {
  FinanceAccessProvider,
  useFinanceAccess,
} from "@/contexts/finance-access-context";
import { useAuth } from "@/contexts/auth-context";

const NAV_ITEMS = [
  { href: "/finance", label: "Dashboard", icon: LayoutDashboard },
  { href: "/finance/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
  { href: "/finance/caixas", label: "Caixas", icon: Wallet },
  { href: "/finance/contas-pagar", label: "Contas a Pagar", icon: ArrowDownCircle },
  { href: "/finance/contas-receber", label: "Contas a Receber", icon: ArrowUpCircle },
  { href: "/finance/contratos", label: "Contratos", icon: FileSignature },
  { href: "/finance/metas", label: "Metas", icon: Target },
  { href: "/finance/eventos", label: "Eventos", icon: Calendar },
  { href: "/finance/categorias", label: "Categorias", icon: FolderTree },
  { href: "/finance/formas-pagamento", label: "Formas de Pagamento", icon: CreditCard },
  { href: "/finance/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/finance/auditoria", label: "Auditoria", icon: FileText },
];

export function FinanceNav({ className = "" }: Readonly<{ className?: string }>) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação do módulo financeiro"
      className={cn("flex flex-col gap-1", className)}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-small font-medium transition-colors duration-150",
              isActive
                ? "bg-primary-100 text-primary-800 dark:bg-primary-900/45 dark:text-primary-200"
                : "text-[var(--text-secondary)] hover:bg-neutral-100 hover:text-[var(--text-primary)] dark:hover:bg-neutral-800/90"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function FinanceMobileNavStrip() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Atalhos do financeiro"
      className="hide-scrollbar scroll-touch flex gap-1.5 overflow-x-auto border-t border-[var(--border)] bg-[var(--surface)]/95 px-2 py-2.5 dark:border-[var(--border)] lg:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2.5 text-caption font-semibold transition-colors sm:text-small",
              isActive
                ? "bg-primary-600 text-white shadow-sm dark:bg-primary-500"
                : "bg-[var(--background)] text-[var(--text-primary)] ring-1 ring-[var(--border)] hover:bg-neutral-50 dark:hover:bg-neutral-800/80"
            )}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function FinanceLayoutClient({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <FinanceAccessProvider>
      <div className="flex min-h-dvh flex-col bg-[var(--background)]">
        <header
          className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md dark:border-[var(--border)]"
          style={{ paddingTop: "max(0px, env(safe-area-inset-top, 0px))" }}
        >
          <div className="flex items-center justify-between gap-2 px-safe py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-2 sm:gap-4">
              <Link
                href="/"
                className="inline-flex min-h-11 min-w-0 items-center gap-1 rounded-lg px-1 text-small font-medium text-[var(--text-secondary)] transition-colors hover:bg-neutral-100 hover:text-[var(--text-primary)] dark:hover:bg-neutral-800/80"
              >
                <ArrowLeftRight className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate sm:max-w-none">Sair</span>
              </Link>
              <span className="hidden border-l border-[var(--border)] pl-4 sm:inline dark:border-[var(--border)]">
                <span className="font-semibold text-[var(--text-primary)]">Módulo Financeiro</span>
              </span>
            </div>
            <ThemeToggle />
          </div>
          <FinanceMobileNavStrip />
        </header>

        <div className="flex flex-1">
          <aside className="hidden w-56 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] p-4 dark:border-[var(--border)] lg:block">
            <FinanceNav />
          </aside>

          <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
            <div className="mx-auto w-full max-w-content">{children}</div>
          </main>
        </div>

        {/* Chat flutuante IA - botão fixo */}
        <FinanceAIChatButton />
        <FinanceModeChooser />
      </div>
    </FinanceAccessProvider>
  );
}

function FinanceAIChatButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-[var(--background)]"
        style={{
          bottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
          right: "max(1rem, env(safe-area-inset-right, 0px))",
        }}
        aria-label={open ? "Fechar chat da IA" : "Abrir chat da IA para análise financeira"}
      >
        <MessageCircle className="h-6 w-6" aria-hidden />
      </button>
      {open && (
        <FinanceAIChatPanel onClose={() => setOpen(false)} />
      )}
    </>
  );
}

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function FinanceAIChatPanel({ onClose }: Readonly<{ onClose: () => void }>) {
  const [context, setContext] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/finance/dashboard")
      .then((r) => r.json())
      .then((d) => setContext(`Saldo atual: R$ ${d.balance?.toFixed(2) ?? "0,00"}. Entradas no mês: R$ ${d.entriesMonth?.toFixed(2) ?? "0,00"}. Saídas no mês: R$ ${d.exitsMonth?.toFixed(2) ?? "0,00"}. Período: ${d.monthLabel ?? ""}.`))
      .catch(() => setContext("Dados do dashboard não disponíveis."));
  }, []);

  async function handleSend() {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setReply(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: `Você é um assistente financeiro. Responda em português de forma objetiva. Contexto atual do módulo: ${context}` },
            { role: "user", content: msg },
          ],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Erro ao consultar a IA.");
        setLoading(false);
        return;
      }
      setReply((data as { content?: string }).content ?? "Sem resposta.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao consultar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed left-3 right-3 z-50 w-auto max-w-sm sm:left-auto sm:right-6"
      style={{
        bottom: "max(6rem, calc(env(safe-area-inset-bottom, 0px) + 5rem))",
      }}
    >
      <Card padding="md" className="shadow-lg">
        <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2 dark:border-[var(--border)]">
          <h3 className="text-h4 text-[var(--text-primary)]">IA Financeira</h3>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-small text-[var(--text-secondary)]">
          Faça perguntas sobre saldo, movimentações e relatórios. O contexto do dashboard é enviado para a IA.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ex.: Como está o saldo?"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-small outline-none focus:border-primary-500 dark:border-[var(--border)]"
            disabled={loading}
          />
          <Button size="sm" onClick={handleSend} disabled={loading || !input.trim()} leftIcon={<Send className="h-4 w-4" />}>
            Enviar
          </Button>
        </div>
        {error && <p className="mt-2 text-small text-red-600 dark:text-red-400">{error}</p>}
        {reply && <div className="mt-3 rounded-lg bg-neutral-100 p-3 text-small text-[var(--text-primary)] dark:bg-neutral-800">{reply}</div>}
      </Card>
    </div>
  );
}

function FinanceModeChooser() {
  const { mode, setMode } = useFinanceAccess();
  const { user, loading, signOut } = useAuth();

  // Enquanto o estado de autenticação está carregando, não mostramos o chooser
  if (loading && mode === null) return null;

  if (mode !== null) return null;

  const handleAdminClick = () => {
    if (user) {
      setMode("admin");
      return;
    }
    // Se não estiver logado, redireciona para o login admin.
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const handleVisitorClick = () => {
    setMode("visitor");
  };

  const handleSignOut = async () => {
    await signOut();
    // Mantém o chooser aberto para o usuário escolher novamente
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <Card padding="lg" className="max-w-md">
        <h2 className="text-h3 text-[var(--text-primary)]">Como deseja acessar o financeiro?</h2>
        <p className="mt-2 text-body text-[var(--text-secondary)]">
          Você pode entrar como <strong>administrador</strong> (mesmo login do painel admin) ou como{" "}
          <strong>visitante</strong> (apenas leitura, como um portal de transparência).
        </p>
        {user && (
          <p className="mt-2 rounded-md bg-neutral-100 px-3 py-2 text-small text-[var(--text-secondary)] dark:bg-neutral-800">
            Logado como <strong className="text-[var(--text-primary)]">{user.name}</strong>{" "}
            (<span className="font-mono">{user.email}</span>).{" "}
            <button
              type="button"
              onClick={handleSignOut}
              className="text-primary-600 hover:underline dark:text-primary-400"
            >
              Sair
            </button>
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={handleVisitorClick}
          >
            Entrar como visitante
          </Button>
          <Button
            variant="primary"
            onClick={handleAdminClick}
          >
            Entrar como admin
          </Button>
        </div>
      </Card>
    </div>
  );
}
