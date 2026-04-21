"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = { id: string; name: string; type: string };
type PaymentMethod = { id: string; name: string };

export default function NovoContratoPage() {
  const router = useRouter();
  const [contractNumber, setContractNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [totalValue, setTotalValue] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [generateInstallments, setGenerateInstallments] = useState(false);
  const [installments, setInstallments] = useState("1");
  const [firstDueDate, setFirstDueDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/finance/categories").then((r) => r.json()),
      fetch("/api/finance/payment-methods").then((r) => r.json()),
    ])
      .then(([cat, pm]) => {
        if (!cancelled) {
          setCategories(Array.isArray(cat) ? cat : []);
          setPaymentMethods(Array.isArray(pm) ? pm : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCategories([]);
          setPaymentMethods([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const entriesCategories = categories.filter((c) => c.type === "entry");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const value = Number.parseFloat(totalValue.replaceAll(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      setError("Informe um valor total válido.");
      return;
    }

    if (!contractNumber.trim()) {
      setError("Número do contrato é obrigatório.");
      return;
    }

    if (generateInstallments) {
      const inst = Number.parseInt(installments, 10);
      if (!Number.isFinite(inst) || inst < 1 || inst > 60) {
        setError("Número de parcelas deve estar entre 1 e 60.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/finance/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractNumber: contractNumber.trim(),
          clientName: clientName.trim() || null,
          totalValue: value,
          startDate,
          endDate: endDate || null,
          description: description.trim() || null,
          installments: generateInstallments
            ? Number.parseInt(installments, 10)
            : null,
          categoryId: generateInstallments && categoryId ? categoryId : null,
          paymentMethodId:
            generateInstallments && paymentMethodId ? paymentMethodId : null,
          firstDueDate: generateInstallments ? firstDueDate : null,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar contrato.");
        setLoading(false);
        return;
      }

      router.push("/finance/contratos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-lg flex flex-wrap items-center gap-4">
        <Link
          href="/finance/contratos"
          className="inline-flex items-center gap-1 text-small font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Voltar
        </Link>
        <h1 className="text-h2 font-semibold text-[var(--text-primary)]">
          Novo contrato
        </h1>
      </div>

      <Card padding="lg" className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-small text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
              role="alert"
            >
              {error}
            </p>
          )}

          <Input
            id="contractNumber"
            label="Número do contrato *"
            placeholder="Ex.: CTR-2024-001"
            value={contractNumber}
            onChange={(e) => setContractNumber(e.target.value)}
            required
          />

          <Input
            id="clientName"
            label="Nome do cliente (opcional)"
            placeholder="Ex.: Empresa XYZ"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />

          <Input
            id="totalValue"
            type="text"
            inputMode="decimal"
            label="Valor total do contrato (R$) *"
            placeholder="0,00"
            value={totalValue}
            onChange={(e) =>
              setTotalValue(
                e.target.value
                  .replaceAll(/[^\d,]/g, "")
                  .replace(/(\d+),(\d{2}).*/, "$1,$2")
              )
            }
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="startDate"
              type="date"
              label="Data de início *"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />

            <Input
              id="endDate"
              type="date"
              label="Data de término (opcional)"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-small font-medium text-neutral-700 dark:text-neutral-300"
            >
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-20 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600"
              placeholder="Detalhes adicionais sobre o contrato"
            />
          </div>

          <div className="border-t border-neutral-200 pt-4 dark:border-neutral-700">
            <div className="mb-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="generateInstallments"
                checked={generateInstallments}
                onChange={(e) => setGenerateInstallments(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <label
                htmlFor="generateInstallments"
                className="text-small font-medium text-neutral-700 dark:text-neutral-300"
              >
                Gerar parcelas (contas a receber) automaticamente
              </label>
            </div>

            {generateInstallments && (
              <div className="ml-6 space-y-4">
                <Input
                  id="installments"
                  type="number"
                  label="Número de parcelas *"
                  placeholder="Ex.: 12"
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  min="1"
                  max="60"
                  required={generateInstallments}
                />

                <Input
                  id="firstDueDate"
                  type="date"
                  label="Data do primeiro vencimento *"
                  value={firstDueDate}
                  onChange={(e) => setFirstDueDate(e.target.value)}
                  required={generateInstallments}
                />

                <div>
                  <label
                    htmlFor="categoryId"
                    className="mb-1 block text-small font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Categoria (opcional)
                  </label>
                  <select
                    id="categoryId"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600"
                    disabled={loadingOptions}
                  >
                    <option value="">Selecione</option>
                    {entriesCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="paymentMethodId"
                    className="mb-1 block text-small font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Forma de pagamento (opcional)
                  </label>
                  <select
                    id="paymentMethodId"
                    value={paymentMethodId}
                    onChange={(e) => setPaymentMethodId(e.target.value)}
                    className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600"
                    disabled={loadingOptions}
                  >
                    <option value="">Selecione</option>
                    {paymentMethods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              loading={loading}
              disabled={loading || loadingOptions}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Salvar
            </Button>
            <Link href="/finance/contratos">
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
