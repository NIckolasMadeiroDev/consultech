"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceAccess } from "@/contexts/finance-access-context";

type PaymentMethod = {
  id: string;
  name: string;
};

export default function FinanceFormasPagamentoPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { mode } = useFinanceAccess();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/finance/payment-methods")
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar formas de pagamento.");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setMethods(json);
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

  async function handleDelete(id: string) {
    if (mode === "visitor") return;
    if (!confirm("Excluir esta forma de pagamento?")) return;
    const res = await fetch(`/api/finance/payment-methods/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error ?? "Erro ao excluir.");
      return;
    }
    setMethods((prev) => prev.filter((m) => m.id !== id));
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-lg text-h2 font-semibold text-[var(--text-primary)]">
          Formas de Pagamento
        </h1>
        <div className="h-48 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-lg text-h2 font-semibold text-[var(--text-primary)]">
          Formas de Pagamento
        </h1>
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
          <h1 className="text-h2 font-semibold text-[var(--text-primary)]">
            Formas de Pagamento
          </h1>
          <p className="mt-1 text-body text-[var(--text-secondary)]">
            Dinheiro, PIX, cartão, boleto, etc. Usadas ao registrar entradas e saídas.
          </p>
        </div>
        {mode === "admin" && (
          <Link href="/finance/formas-pagamento/novo">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Nova forma de pagamento</Button>
          </Link>
        )}
      </div>

      {methods.length === 0 ? (
        <Card padding="lg" className="border-dashed border-neutral-300 dark:border-neutral-600">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CreditCard className="mb-4 h-12 w-12 text-[var(--text-secondary)]" aria-hidden />
            <p className="text-body text-[var(--text-secondary)]">
              Nenhuma forma de pagamento cadastrada. Cadastre para usar em movimentações.
            </p>
            {mode === "admin" && (
              <Link href="/finance/formas-pagamento/novo" className="mt-4">
                <Button variant="primary">Nova forma de pagamento</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {methods.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 px-lg py-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                    <CreditCard className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">{m.name}</span>
                </div>
                <div>
                  {mode === "admin" && (
                    <>
                      <Link href={`/finance/formas-pagamento/${m.id}/editar`} className="mr-2 inline-flex items-center gap-1 text-small text-primary-600 hover:underline">
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </Link>
                      <button type="button" onClick={() => handleDelete(m.id)} className="inline-flex items-center gap-1 text-small text-red-600 hover:underline">
                        <Trash2 className="h-3.5 w-3.5" /> Excluir
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
