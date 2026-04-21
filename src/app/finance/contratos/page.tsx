"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoneyValue } from "@/components/finance";

type Contract = {
  id: string;
  contractNumber: string;
  clientName: string | null;
  totalValue: number;
  startDate: string;
  endDate: string | null;
  status: string;
  receivablesCount: number;
  pendingAmount: number;
  receivedAmount: number;
};

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export default function FinanceContratosPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("active");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/finance/contracts?status=${statusFilter}`)
      .then((r) => {
        if (!r.ok) throw new Error("Falha ao carregar contratos");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setContracts(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [statusFilter]);

  return (
    <div>
      <div className="mb-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-semibold text-[var(--text-primary)]">
            Contratos
          </h1>
          <p className="mt-1 text-body text-[var(--text-secondary)]">
            Gerencie contratos e acompanhe faturamento vinculado.
          </p>
        </div>
        <Link href="/finance/contratos/novo">
          <Button leftIcon={<Plus className="h-4 w-4" />}>Novo contrato</Button>
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter("active")}
          className={`rounded-lg px-3 py-1.5 text-small font-medium ${
            statusFilter === "active"
              ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
              : "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
          }`}
        >
          Ativos
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("completed")}
          className={`rounded-lg px-3 py-1.5 text-small font-medium ${
            statusFilter === "completed"
              ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
              : "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
          }`}
        >
          Concluídos
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("cancelled")}
          className={`rounded-lg px-3 py-1.5 text-small font-medium ${
            statusFilter === "cancelled"
              ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
              : "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
          }`}
        >
          Cancelados
        </button>
      </div>

      {loading && (
        <Card padding="lg">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        </Card>
      )}

      {error && (
        <Card padding="lg" className="border-red-200 dark:border-red-800">
          <p className="text-body text-red-600 dark:text-red-400">{error}</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </Card>
      )}

      {!loading && !error && (
        <>
          {contracts.length === 0 ? (
            <Card padding="lg">
              <div className="flex flex-col items-center justify-center py-16">
                <FileText
                  className="mb-4 h-12 w-12 text-[var(--text-secondary)]"
                  aria-hidden
                />
                <p className="text-body text-[var(--text-secondary)]">
                  {statusFilter === "active"
                    ? "Nenhum contrato ativo."
                    : "Nenhum contrato encontrado."}
                </p>
                {statusFilter === "active" && (
                  <Link href="/finance/contratos/novo" className="mt-4">
                    <Button variant="primary">Criar primeiro contrato</Button>
                  </Link>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {contracts.map((contract) => {
                const progressPercent =
                  contract.totalValue > 0
                    ? (contract.receivedAmount / contract.totalValue) * 100
                    : 0;

                return (
                  <Link key={contract.id} href={`/finance/contratos/${contract.id}`}>
                    <Card
                      padding="lg"
                      className="transition-shadow hover:shadow-md"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-small font-medium text-[var(--text-primary)]">
                            {contract.contractNumber}
                          </p>
                          {contract.clientName && (
                            <p className="text-small text-[var(--text-secondary)]">
                              {contract.clientName}
                            </p>
                          )}
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            STATUS_COLORS[contract.status]
                          }`}
                        >
                          {STATUS_LABELS[contract.status]}
                        </span>
                      </div>

                      <div className="mb-3 space-y-1">
                        <div className="flex items-center justify-between text-small">
                          <span className="text-[var(--text-secondary)]">
                            Valor total
                          </span>
                          <MoneyValue
                            value={contract.totalValue}
                            variant="neutral"
                            size="small"
                          />
                        </div>
                        <div className="flex items-center justify-between text-small">
                          <span className="text-[var(--text-secondary)]">
                            Recebido
                          </span>
                          <MoneyValue
                            value={contract.receivedAmount}
                            variant="entry"
                            size="small"
                          />
                        </div>
                        <div className="flex items-center justify-between text-small">
                          <span className="text-[var(--text-secondary)]">
                            Pendente
                          </span>
                          <MoneyValue
                            value={contract.pendingAmount}
                            variant="exit"
                            size="small"
                          />
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-[var(--text-secondary)]">
                            Progresso
                          </span>
                          <span className="font-medium text-[var(--text-primary)]">
                            {Math.round(progressPercent)}%
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                          <div
                            className="h-full rounded-full bg-primary-600 transition-all"
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 text-xs text-[var(--text-secondary)]">
                        <TrendingUp className="h-3 w-3" />
                        <span>{contract.receivablesCount} parcelas</span>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
