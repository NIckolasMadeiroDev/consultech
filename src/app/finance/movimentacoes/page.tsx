"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeftRight, Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoneyValue, CategoryBadge } from "@/components/finance";
import { useFinanceAccess } from "@/contexts/finance-access-context";

type TransactionRow = {
  id: string;
  date: string;
  description: string;
  category: string;
  type: string;
  amount: number;
};

type Cashbox = { id: string; name: string };
type Category = { id: string; name: string; type: string };

const TIPOS = [
  { value: "", label: "Todos" },
  { value: "entry", label: "Entrada" },
  { value: "exit", label: "Saída" },
  { value: "transfer", label: "Transferência" },
  { value: "withdraw", label: "Sangria" },
  { value: "supply", label: "Suprimento" },
];

export default function FinanceMovimentacoesPage() {
  const [data, setData] = useState<{ items: TransactionRow[]; total: number; page: number; limit: number }>({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [cashboxId, setCashboxId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { mode } = useFinanceAccess();
  const readOnly = mode === "visitor";

  const load = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(data.page));
    params.set("limit", String(data.limit));
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (typeFilter) params.set("type", typeFilter);
    if (cashboxId) params.set("cashboxId", cashboxId);
    if (categoryId) params.set("categoryId", categoryId);
    setLoading(true);
    fetch(`/api/finance/transactions?${params}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Falha ao carregar movimentações.");
        }
        return res.json();
      })
      .then((json) => {
        setData((prev) => ({
          ...prev,
          items: json.items ?? [],
          total: json.total ?? 0,
          page: json.page ?? 1,
          limit: json.limit ?? 20,
        }));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erro"))
      .finally(() => setLoading(false));
  }, [data.page, data.limit, dateFrom, dateTo, typeFilter, cashboxId, categoryId]);

  useEffect(() => {
    load();
  }, [data.page, data.limit]);

  useEffect(() => {
    fetch("/api/finance/cashboxes?all=1").then((r) => r.json()).then(setCashboxes).catch(() => setCashboxes([]));
    fetch("/api/finance/categories").then((r) => r.json()).then(setCategories).catch(() => setCategories([]));
  }, []);

  const applyFilters = () => {
    setData((prev) => ({ ...prev, page: 1 }));
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", String(data.limit));
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (typeFilter) params.set("type", typeFilter);
    if (cashboxId) params.set("cashboxId", cashboxId);
    if (categoryId) params.set("categoryId", categoryId);
    fetch(`/api/finance/transactions?${params}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Falha ao carregar.");
        }
        return res.json();
      })
      .then((json) => {
        setData((prev) => ({
          ...prev,
          page: 1,
          items: json.items ?? [],
          total: json.total ?? 0,
          limit: json.limit ?? 20,
        }));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erro"))
      .finally(() => setLoading(false));
  };

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta movimentação? Esta ação não pode ser desfeita.")) return;
    const res = await fetch(`/api/finance/transactions/${id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(json.error ?? "Erro ao excluir.");
      return;
    }
    load();
  }

  const isEntry = (type: string) => type === "entry" || type === "supply";
  const isExit = (type: string) => type === "exit" || type === "withdraw";
  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <div>
      <div className="mb-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-semibold text-[var(--text-primary)]">Movimentações</h1>
          <p className="mt-1 text-body text-[var(--text-secondary)]">
            Registro de entradas, saídas, sangrias, suprimentos e transferências.
          </p>
        </div>
        {mode === "admin" && (
          <Link href="/finance/movimentacoes/nova">
            <Button className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              Nova movimentação
            </Button>
          </Link>
        )}
      </div>

      <Card padding="md" className="mb-lg">
        <p className="mb-2 text-small font-medium text-[var(--text-primary)]">Filtros</p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="filter-date-from" className="mb-1 block text-caption text-[var(--text-secondary)]">De</label>
            <input
              id="filter-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 rounded-lg border border-neutral-300 bg-[var(--background)] px-2 text-small dark:border-neutral-600"
            />
          </div>
          <div>
            <label htmlFor="filter-date-to" className="mb-1 block text-caption text-[var(--text-secondary)]">Até</label>
            <input
              id="filter-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 rounded-lg border border-neutral-300 bg-[var(--background)] px-2 text-small dark:border-neutral-600"
            />
          </div>
          <div>
            <label htmlFor="filter-type" className="mb-1 block text-caption text-[var(--text-secondary)]">Tipo</label>
            <select
              id="filter-type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 rounded-lg border border-neutral-300 bg-[var(--background)] px-2 text-small dark:border-neutral-600"
            >
              {TIPOS.map((t) => (
                <option key={t.value || "all"} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-cashbox" className="mb-1 block text-caption text-[var(--text-secondary)]">Caixa</label>
            <select
              id="filter-cashbox"
              value={cashboxId}
              onChange={(e) => setCashboxId(e.target.value)}
              className="h-9 min-w-[140px] rounded-lg border border-neutral-300 bg-[var(--background)] px-2 text-small dark:border-neutral-600"
            >
              <option value="">Todos</option>
              {cashboxes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-category" className="mb-1 block text-caption text-[var(--text-secondary)]">Categoria</label>
            <select
              id="filter-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-9 min-w-[140px] rounded-lg border border-neutral-300 bg-[var(--background)] px-2 text-small dark:border-neutral-600"
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <Button size="sm" variant="secondary" onClick={applyFilters}>Filtrar</Button>
        </div>
      </Card>

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
          <Button variant="primary" className="mt-4" onClick={() => load()}>Tentar novamente</Button>
        </Card>
      )}

      {!loading && !error && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead>
                <tr className="border-b border-neutral-200 bg-[var(--surface)] dark:border-neutral-700">
                  <th className="p-lg font-medium text-[var(--text-primary)]">Data</th>
                  <th className="p-lg font-medium text-[var(--text-primary)]">Descrição</th>
                  <th className="p-lg font-medium text-[var(--text-primary)]">Categoria</th>
                  <th className="p-lg text-right font-medium text-[var(--text-primary)]">Entrada</th>
                  <th className="p-lg text-right font-medium text-[var(--text-primary)]">Saída</th>
                  {mode === "admin" && (
                    <th className="p-lg font-medium text-[var(--text-primary)]">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.items.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-neutral-100 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
                  >
                    <td className="p-lg text-[var(--text-secondary)]">
                      {new Date(t.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-lg font-medium text-[var(--text-primary)]">{t.description}</td>
                    <td className="p-lg">
                      <CategoryBadge label={t.category} variant={isEntry(t.type) ? "entry" : "exit"} />
                    </td>
                    <td className="p-lg text-right font-mono">
                      {isEntry(t.type) ? <MoneyValue value={t.amount} variant="entry" size="table" /> : <span className="text-[var(--text-secondary)]">—</span>}
                    </td>
                    <td className="p-lg text-right font-mono">
                      {isExit(t.type) ? <MoneyValue value={t.amount} variant="exit" size="table" /> : <span className="text-[var(--text-secondary)]">—</span>}
                    </td>
                    {mode === "admin" && (
                      <td className="p-lg">
                        <Link href={`/finance/movimentacoes/${t.id}/editar`} className="mr-2 inline-flex items-center gap-1 text-primary-600 hover:underline">
                          <Pencil className="h-3.5 w-3.5" /> Editar
                        </Link>
                        <button type="button" onClick={() => handleDelete(t.id)} className="inline-flex items-center gap-1 text-red-600 hover:underline">
                          <Trash2 className="h-3.5 w-3.5" /> Excluir
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.items.length === 0 && mode === "admin" && (
            <div className="flex flex-col items-center justify-center py-16">
              <ArrowLeftRight className="mb-4 h-12 w-12 text-[var(--text-secondary)]" aria-hidden />
              <p className="text-body text-[var(--text-secondary)]">Nenhuma movimentação encontrada.</p>
              <Link href="/finance/movimentacoes/nova" className="mt-4">
                <Button variant="primary">Nova movimentação</Button>
              </Link>
            </div>
          )}
          {data.total > 0 && (
            <div className="flex items-center justify-between border-t border-neutral-200 px-lg py-3 dark:border-neutral-700">
              <p className="text-small text-[var(--text-secondary)]">
                {data.total} registro(s) · Página {data.page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={data.page <= 1}
                  onClick={() => setData((p) => ({ ...p, page: p.page - 1 }))}
                >
                  Anterior
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={data.page >= totalPages}
                  onClick={() => setData((p) => ({ ...p, page: p.page + 1 }))}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
