"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDownCircle, Plus, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoneyValue } from "@/components/finance";
import { useFinanceAccess } from "@/contexts/finance-access-context";

type Payable = {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
  paidAt: string | null;
  category: string | null;
  paymentMethod: string | null;
  cashbox: string | null;
};

export default function FinanceContasPagarPage() {
  const [items, setItems] = useState<Payable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const { mode } = useFinanceAccess();
  const readOnly = mode === "visitor";

  const load = () => {
    setLoading(true);
    fetch(`/api/finance/payables?status=${statusFilter}`)
      .then((r) => {
        if (!r.ok) {
          throw new Error("Falha ao carregar.");
        }
        return r.json();
      })
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function quitar(id: string, cashboxId: string) {
    if (!cashboxId) {
      alert("Selecione o caixa para pagamento.");
      return;
    }
    const res = await fetch(`/api/finance/payables/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cashboxId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error ?? "Erro ao quitar.");
      return;
    }
    load();
  }

  return (
    <div>
      <div className="mb-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-semibold text-[var(--text-primary)]">Contas a Pagar</h1>
          <p className="mt-1 text-body text-[var(--text-secondary)]">
            Controle de obrigações a pagar. Quitar gera uma saída no caixa.
          </p>
        </div>
        {mode === "admin" && (
          <Link href="/finance/contas-pagar/novo">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Nova conta a pagar</Button>
          </Link>
        )}
      </div>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter("pending")}
          className={`rounded-lg px-3 py-1.5 text-small font-medium ${statusFilter === "pending" ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300" : "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"}`}
        >
          Pendentes
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("paid")}
          className={`rounded-lg px-3 py-1.5 text-small font-medium ${statusFilter === "paid" ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300" : "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"}`}
        >
          Pagas
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
          <Button variant="primary" className="mt-4" onClick={load}>Tentar novamente</Button>
        </Card>
      )}

      {!loading && !error && (
        <Card padding="none">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ArrowDownCircle className="mb-4 h-12 w-12 text-[var(--text-secondary)]" aria-hidden />
              <p className="text-body text-[var(--text-secondary)]">
                {statusFilter === "pending" ? "Nenhuma conta a pagar pendente." : "Nenhuma conta paga no filtro."}
              </p>
              {statusFilter === "pending" && mode === "admin" && (
                <Link href="/finance/contas-pagar/novo" className="mt-4">
                  <Button variant="primary">Nova conta a pagar</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-small">
                <thead>
                  <tr className="border-b border-neutral-200 bg-[var(--surface)] dark:border-neutral-700">
                    <th className="p-lg font-medium text-[var(--text-primary)]">Vencimento</th>
                    <th className="p-lg font-medium text-[var(--text-primary)]">Descrição</th>
                    <th className="p-lg font-medium text-[var(--text-primary)]">Categoria</th>
                    <th className="p-lg text-right font-medium text-[var(--text-primary)]">Valor</th>
                    {statusFilter === "paid" && <th className="p-lg font-medium text-[var(--text-primary)]">Pago em</th>}
                    {statusFilter === "pending" && mode === "admin" && (
                      <th className="p-lg font-medium text-[var(--text-primary)]">Ações</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50">
                      <td className="p-lg text-[var(--text-secondary)]">{new Date(p.dueDate).toLocaleDateString("pt-BR")}</td>
                      <td className="p-lg font-medium text-[var(--text-primary)]">{p.description}</td>
                      <td className="p-lg text-[var(--text-secondary)]">{p.category ?? "—"}</td>
                      <td className="p-lg text-right font-mono"><MoneyValue value={p.amount} variant="exit" size="table" /></td>
                      {statusFilter === "paid" && (
                        <td className="p-lg text-[var(--text-secondary)]">
                          {p.paidAt ? new Date(p.paidAt).toLocaleDateString("pt-BR") : "—"}
                        </td>
                      )}
                      {statusFilter === "pending" && mode === "admin" && (
                        <td className="p-lg">
                          <Link href={`/finance/contas-pagar/${p.id}/editar`} className="mr-2 text-primary-600 hover:underline">Editar</Link>
                          <QuitarButton payableId={p.id} onQuitar={quitar} onSuccess={load} />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function QuitarButton({ payableId, onQuitar, onSuccess }: Readonly<{ payableId: string; onQuitar: (id: string, cashboxId: string) => void; onSuccess: () => void }>) {
  const [cashboxes, setCashboxes] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [cashboxId, setCashboxId] = useState("");
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    fetch("/api/finance/cashboxes").then((r) => r.json()).then(setCashboxes).catch(() => setCashboxes([]));
  }, []);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  const close = () => setOpen(false);

  const handleQuitar = () => {
    if (!cashboxId) return;
    setLoading(true);
    onQuitar(payableId, cashboxId);
    close();
    setCashboxId("");
    setLoading(false);
    onSuccess();
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-green-600 hover:underline">
        <CheckCircle className="h-4 w-4" /> Quitar
      </button>
      <dialog
        ref={dialogRef}
        className="fixed inset-0 z-50 m-0 max-h-none max-w-none rounded-none border-0 bg-transparent p-0 [&::backdrop]:bg-black/50"
        aria-label="Quitar conta a pagar"
        onCancel={close}
      >
        <button
          type="button"
          aria-label="Fechar modal"
          className="absolute inset-0 cursor-default bg-black/50"
          onClick={close}
        />
        <div className="relative z-10 mx-auto mt-[10vh] w-full max-w-sm rounded-lg bg-[var(--background)] p-4 shadow-lg">
          <p className="mb-3 font-medium text-[var(--text-primary)]">Quitar conta a pagar</p>
          <label htmlFor="quitar-cashbox-select" className="mb-1 block text-small text-[var(--text-secondary)]">Caixa para débito</label>
          <select
            id="quitar-cashbox-select"
            value={cashboxId}
            onChange={(e) => setCashboxId(e.target.value)}
            className="mb-4 h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 dark:border-neutral-600"
          >
            <option value="">Selecione</option>
            {cashboxes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={close}>Cancelar</Button>
            <Button disabled={!cashboxId || loading} onClick={handleQuitar}>Confirmar pagamento</Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
