"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = { id: string; name: string; type: string };
type PaymentMethod = { id: string; name: string };
type Cashbox = { id: string; name: string };

export default function EditarContaReceberPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [cashboxId, setCashboxId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/finance/receivables/${id}`)
      .then((r) => {
        if (!r.ok) {
          throw new Error("Conta não encontrada.");
        }
        return r.json();
      })
      .then((r) => {
        setDescription(r.description ?? "");
        setAmount(String(r.amount ?? "").replace(".", ","));
        setDueDate(r.dueDate?.slice(0, 10) ?? "");
        setCategoryId(r.categoryId ?? "");
        setPaymentMethodId(r.paymentMethodId ?? "");
        setCashboxId(r.cashboxId ?? "");
      })
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Erro"));
  }, [id]);

  useEffect(() => {
    Promise.all([
      fetch("/api/finance/categories").then((r) => r.json()),
      fetch("/api/finance/payment-methods").then((r) => r.json()),
      fetch("/api/finance/cashboxes").then((r) => r.json()),
    ]).then(([c, pm, cb]) => {
      setCategories(Array.isArray(c) ? c.filter((x: Category) => x.type === "entry") : []);
      setPaymentMethods(Array.isArray(pm) ? pm : []);
      setCashboxes(Array.isArray(cb) ? cb : []);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    const value = Number.parseFloat(amount.replaceAll(",", "."));
    if (!description.trim()) { setSubmitError("Descrição é obrigatória."); return; }
    if (!Number.isFinite(value) || value <= 0) { setSubmitError("Valor deve ser positivo."); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/finance/receivables/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim(), amount: value, dueDate: dueDate || undefined, categoryId: categoryId || null, paymentMethodId: paymentMethodId || null, cashboxId: cashboxId || null }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) { setSubmitError(data.error ?? "Erro ao atualizar."); setLoading(false); return; }
      router.push("/finance/contas-receber");
      router.refresh();
    } catch (err) { setSubmitError(err instanceof Error ? err.message : "Erro."); setLoading(false); }
  }

  if (loadError) {
    return (
      <div>
        <h1 className="mb-lg text-h2 font-semibold text-[var(--text-primary)]">Editar conta a receber</h1>
        <Card padding="lg" className="border-red-200 dark:border-red-800">
          <p className="text-body text-red-600 dark:text-red-400">{loadError}</p>
          <Link href="/finance/contas-receber" className="mt-4 inline-block"><Button variant="secondary">Voltar</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-lg flex flex-wrap items-center gap-4">
        <Link href="/finance/contas-receber" className="inline-flex items-center gap-1 text-small font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
        <h1 className="text-h2 font-semibold text-[var(--text-primary)]">Editar conta a receber</h1>
      </div>
      <Card padding="lg" className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-small text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200" role="alert">{submitError}</p>}
          <Input id="description" label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <Input id="amount" type="text" inputMode="decimal" label="Valor (R$)" value={amount} onChange={(e) => setAmount(e.target.value.replaceAll(/[^\d,]/g, "").replace(/(\d+),(\d{2}).*/, "$1,$2"))} required />
          <div>
            <label htmlFor="recv-edit-due" className="mb-1 block text-small font-medium text-neutral-700 dark:text-neutral-300">Vencimento</label>
            <input id="recv-edit-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 dark:border-neutral-600" required />
          </div>
          <div>
            <label htmlFor="recv-edit-cat" className="mb-1 block text-small font-medium text-neutral-700 dark:text-neutral-300">Categoria (opcional)</label>
            <select id="recv-edit-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 dark:border-neutral-600">
              <option value="">Selecione</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="recv-edit-pm" className="mb-1 block text-small font-medium text-neutral-700 dark:text-neutral-300">Forma de pagamento (opcional)</label>
            <select id="recv-edit-pm" value={paymentMethodId} onChange={(e) => setPaymentMethodId(e.target.value)} className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 dark:border-neutral-600">
              <option value="">Selecione</option>
              {paymentMethods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="recv-edit-cashbox" className="mb-1 block text-small font-medium text-neutral-700 dark:text-neutral-300">Caixa (opcional)</label>
            <select id="recv-edit-cashbox" value={cashboxId} onChange={(e) => setCashboxId(e.target.value)} className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 dark:border-neutral-600">
              <option value="">Selecione</option>
              {cashboxes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} disabled={loading} leftIcon={<Save className="h-4 w-4" />}>Salvar</Button>
            <Link href="/finance/contas-receber"><Button type="button" variant="secondary">Cancelar</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
