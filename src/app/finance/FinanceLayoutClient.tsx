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
} from "lucide-react";
import { ThemeToggle } from "@/components/layout";
import { cn } from "@/lib/utils";
import {
  FinanceAccessProvider,
  useFinanceAccess,
} from "@/contexts/finance-access-context";

const NAV_ITEMS = [
  { href: "/finance", label: "Dashboard", icon: LayoutDashboard },
  { href: "/finance/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
  { href: "/finance/caixas", label: "Caixas", icon: Wallet },
  { href: "/finance/contas-pagar", label: "Contas a Pagar", icon: ArrowDownCircle },
  { href: "/finance/contas-receber", label: "Contas a Receber", icon: ArrowUpCircle },
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
                ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                : "text-[var(--text-secondary)] hover:bg-neutral-100 hover:text-[var(--text-primary)] dark:hover:bg-neutral-800"
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

export function FinanceLayoutClient({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <FinanceAccessProvider>
      <div className="flex min-h-screen flex-col bg-[var(--background)]">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-neutral-200 bg-[var(--background)]/95 px-4 py-3 backdrop-blur sm:px-6 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-small font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden />
              Sair do Financeiro
            </Link>
            <span className="hidden border-l border-neutral-200 pl-4 dark:border-neutral-600 sm:inline">
              <span className="font-semibold text-[var(--text-primary)]">Módulo Financeiro</span>
            </span>
          </div>
          <ThemeToggle />
        </header>

        <div className="flex flex-1">
          <aside className="hidden w-56 shrink-0 border-r border-neutral-200 bg-[var(--surface)] p-4 dark:border-neutral-700 lg:block">
            <FinanceNav />
          </aside>

          <main className="min-w-0 flex-1 p-4 sm:p-6">
            <div className="mx-auto max-w-content">{children}</div>
          </main>
        </div>

        {/* Chat flutuante IA - botão fixo */}
        <FinanceAIChatButton />

        {/* Seleção de modo (admin x visitante) */}
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
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-[var(--background)]"
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
    <div className="fixed bottom-24 right-6 z-50 w-full max-w-sm sm:right-6">
      <Card padding="md" className="shadow-lg">
        <div className="flex items-center justify-between gap-2 border-b border-neutral-200 pb-2 dark:border-neutral-700">
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
            className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-small outline-none focus:border-primary-500 dark:border-neutral-600"
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

  if (mode !== null) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <Card padding="lg" className="max-w-md">
        <h2 className="text-h3 text-[var(--text-primary)]">Como deseja acessar o financeiro?</h2>
        <p className="mt-2 text-body text-[var(--text-secondary)]">
          Você pode entrar como <strong>administrador</strong>, com acesso total, ou como{" "}
          <strong>visitante</strong>, apenas para visualizar dados (sem cadastrar ou editar nada).
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={() => setMode("visitor")}
          >
            Entrar como visitante
          </Button>
          <Button
            variant="primary"
            onClick={() => setMode("admin")}
          >
            Entrar como admin
          </Button>
        </div>
      </Card>
    </div>
  );
}
