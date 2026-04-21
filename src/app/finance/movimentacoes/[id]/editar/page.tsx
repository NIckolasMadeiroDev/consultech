"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryHierarchicalSelect } from "@/components/finance";

const TIPOS = [
  { value: "entry", label: "Entrada" },
  { value: "exit", label: "Saída" },
  { value: "transfer", label: "Transferência" },
  { value: "withdraw", label: "Sangria" },
  { value: "supply", label: "Suprimento" },
] as const;

type Cashbox = { id: string; name: string };
type Category = { id: string; name: string; type: string; parentId: string | null };
type PaymentMethod = { id: string; name: string };

export default function EditarMovimentacaoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [type, setType] = useState<string>("entry");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [cashboxOriginId, setCashboxOriginId] = useState("");
  const [cashboxDestId, setCashboxDestId] = useState("");
  const [movementDate, setMovementDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [cashboxes, setCashboxes] = useState<Cashbox[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/finance/cashboxes").then((r) => r.json()),
      fetch("/api/finance/categories").then((r) => r.json()),
      fetch("/api/finance/payment-methods").then((r) => r.json()),
    ])
      .then(([c, cat, pm]) => {
        if (!cancelled) {
          setCashboxes(Array.isArray(c) ? c : []);
          setCategories(Array.isArray(cat) ? cat : []);
          setPaymentMethods(Array.isArray(pm) ? pm : []);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/finance/transactions/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Movimentação não encontrada.");
        return res.json();
      })
      .then((t) => {
        if (!cancelled) {
          setType(t.type ?? "entry");
          setAmount(String(t.amount ?? "").replace(".", ","));
          setDescription(t.description ?? "");
          setCategoryId(t.categoryId ?? "");
          setPaymentMethodId(t.paymentMethodId ?? "");
          setCashboxOriginId(t.cashboxOriginId ?? "");
          setCashboxDestId(t.cashboxDestId ?? "");
          setMovementDate(t.movementAt ?? new Date().toISOString().slice(0, 10));
        }
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Erro ao carregar.");
      });
    return () => { cancelled = true; };
  }, [id]);

  const needsCategory = type === "entry" || type === "exit";
  const needsPaymentMethod = type === "entry" || type === "exit";
  const needsCashboxDest = type === "entry" || type === "supply" || type === "transfer";
  const needsCashboxOrigin = type === "exit" || type === "withdraw" || type === "transfer";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    const value = Number.parseFloat(amount.replaceAll(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      setSubmitError("Informe um valor positivo.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/finance/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: value,
          description: description.trim() || null,
          categoryId: categoryId || null,
          paymentMethodId: paymentMethodId || null,
          cashboxOriginId: cashboxOriginId || null,
          cashboxDestId: cashboxDestId || null,
          movementAt: movementDate,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setSubmitError(data.error ?? "Erro ao atualizar.");
        setLoading(false);
        return;
      }
      router.push("/finance/movimentacoes");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro ao salvar.");
      setLoading(false);
    }
  }

  if (loadError) {
    return (
      <div>
        <h1 className="mb-lg text-h2 font-semibold text-[var(--text-primary)]">Editar movimentação</h1>
        <Card padding="lg" className="border-red-200 dark:border-red-800">
          <p className="text-body text-red-600 dark:text-red-400">{loadError}</p>
          <Link href="/finance/movimentacoes" className="mt-4 inline-block">
            <Button variant="secondary">Voltar</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-lg flex flex-wrap items-center gap-4">
        <Link href="/finance/movimentacoes" className="inline-flex items-center gap-1 text-small font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-h2 font-semibold text-[var(--text-primary)]">Editar movimentação</h1>
      </div>

      <Card padding="lg" className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {(submitError) && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-small text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200" role="alert">
              {submitError}
            </p>
          )}

          <div>
            <label htmlFor="type" className="mb-1 block text-small font-medium text-neutral-700 dark:text-neutral-300">Tipo</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600"
              required
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <Input
            id="movementDate"
            type="date"
            label="Data da movimentação"
            value={movementDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setMovementDate(e.target.value)}
            required
          />

          <Input
            id="amount"
            type="text"
            inputMode="decimal"
            label="Valor (R$)"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replaceAll(/[^\d,]/g, "").replace(/(\d+),(\d{2}).*/, "$1,$2"))}
            required
          />

          <Input id="description" label="Descrição (opcional)" placeholder="Ex.: Venda #1234" value={description} onChange={(e) => setDescription(e.target.value)} />

          {needsCategory && (
            <div>
              <label htmlFor="categoryId" className="mb-1 block text-small font-medium text-neutral-700 dark:text-neutral-300">Categoria</label>
              <CategoryHierarchicalSelect
                categories={categories}
                value={categoryId}
                onChange={setCategoryId}
                type={type as "entry" | "exit"}
                required={needsCategory}
                disabled={loadingOptions}
              />
            </div>
          )}

          {needsPaymentMethod && (
            <div>
              <label htmlFor="paymentMethodId" className="mb-1 block text-small font-medium text-neutral-700 dark:text-neutral-300">Forma de pagamento</label>
              <select
                id="paymentMethodId"
                value={paymentMethodId}
                onChange={(e) => setPaymentMethodId(e.target.value)}
                className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600"
                required={needsPaymentMethod}
              >
                <option value="">Selecione</option>
                {paymentMethods.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {needsCashboxOrigin && (
            <div>
              <label htmlFor="cashboxOriginId" className="mb-1 block text-small font-medium text-neutral-700 dark:text-neutral-300">
                {type === "transfer" ? "Caixa de origem" : "Caixa"}
              </label>
              <select
                id="cashboxOriginId"
                value={cashboxOriginId}
                onChange={(e) => setCashboxOriginId(e.target.value)}
                className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600"
                required={needsCashboxOrigin}
              >
                <option value="">Selecione</option>
                {cashboxes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {needsCashboxDest && (
            <div>
              <label htmlFor="cashboxDestId" className="mb-1 block text-small font-medium text-neutral-700 dark:text-neutral-300">
                {type === "transfer" ? "Caixa de destino" : "Caixa"}
              </label>
              <select
                id="cashboxDestId"
                value={cashboxDestId}
                onChange={(e) => setCashboxDestId(e.target.value)}
                className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600"
                required={needsCashboxDest}
              >
                <option value="">Selecione</option>
                {cashboxes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} disabled={loading || loadingOptions} leftIcon={<Save className="h-4 w-4" />}>Salvar</Button>
            <Link href="/finance/movimentacoes"><Button type="button" variant="secondary">Cancelar</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
