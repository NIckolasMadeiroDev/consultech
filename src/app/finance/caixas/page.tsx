"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, Plus, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BalanceIndicator } from "@/components/finance";
import { useFinanceAccess } from "@/contexts/finance-access-context";

type Cashbox = {
  id: string;
  name: string;
  description: string | null;
  balance: number;
  isActive: boolean;
};

export default function FinanceCaixasPage() {
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { mode } = useFinanceAccess();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/finance/cashboxes")
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar caixas.");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setCashboxes(json);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro desconhecido");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="mb-lg text-h2 font-semibold text-[var(--text-primary)]">Caixas</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-28 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
          <div className="h-28 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
          <div className="h-28 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-lg text-h2 font-semibold text-[var(--text-primary)]">Caixas</h1>
        <Card padding="lg" className="border-red-200 dark:border-red-800">
          <p className="text-body text-red-600 dark:text-red-400">{error}</p>
          <button
            type="button"
            className="mt-4 text-small font-medium text-primary-600 hover:underline"
            onClick={() => globalThis.location.reload()}
          >
            Tentar novamente
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-semibold text-[var(--text-primary)]">Caixas</h1>
          <p className="mt-1 text-body text-[var(--text-secondary)]">
            Controle de caixas (principal, por filial, por operador). Saldo calculado a partir das movimentações.
          </p>
        </div>
        {mode === "admin" && (
          <Link href="/finance/caixas/novo">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Novo caixa</Button>
          </Link>
        )}
      </div>

      {cashboxes.length === 0 ? (
        <Card padding="lg" className="border-dashed border-neutral-300 dark:border-neutral-600">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Wallet className="mb-4 h-12 w-12 text-[var(--text-secondary)]" aria-hidden />
            <p className="text-body text-[var(--text-secondary)]">
              Nenhum caixa cadastrado. Cadastre caixas para registrar movimentações.
            </p>
            {mode === "admin" && (
              <Link href="/finance/caixas/novo" className="mt-4">
                <Button variant="primary">Novo caixa</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cashboxes.map((c) => (
            <Card key={c.id} padding="lg">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                  <Wallet className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-[var(--text-primary)]">{c.name}</h2>
                  {c.description && (
                    <p className="mt-0.5 text-small text-[var(--text-secondary)]">
                      {c.description}
                    </p>
                  )}
                  <BalanceIndicator
                    balance={c.balance}
                    label="Saldo"
                    showAlertWhenNegative
                    className="mt-3"
                  />
                  {mode === "admin" && (
                    <Link href={`/finance/caixas/${c.id}/editar`} className="mt-3 inline-flex items-center gap-1 text-small font-medium text-primary-600 hover:underline">
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
