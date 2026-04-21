"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditarContratoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [contractNumber, setContractNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [totalValue, setTotalValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/finance/contracts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Contrato não encontrado");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setContractNumber(data.contractNumber || "");
          setClientName(data.clientName || "");
          setTotalValue(String(data.totalValue || "").replace(".", ","));
          setStartDate(data.startDate || "");
          setEndDate(data.endDate || "");
          setStatus(data.status || "active");
          setDescription(data.description || "");
        }
      })
      .catch((e) => {
        if (!cancelled)
          setLoadError(e instanceof Error ? e.message : "Erro ao carregar");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const value = Number.parseFloat(totalValue.replaceAll(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      setSubmitError("Informe um valor total válido.");
      return;
    }

    if (!contractNumber.trim()) {
      setSubmitError("Número do contrato é obrigatório.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/finance/contracts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractNumber: contractNumber.trim(),
          clientName: clientName.trim() || null,
          totalValue: value,
          startDate,
          endDate: endDate || null,
          status,
          description: description.trim() || null,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setSubmitError(data.error ?? "Erro ao atualizar contrato.");
        setLoading(false);
        return;
      }

      router.push(`/finance/contratos/${id}`);
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro ao salvar.");
      setLoading(false);
    }
  }

  if (loadError) {
    return (
      <div>
        <h1 className="mb-lg text-h2 font-semibold text-[var(--text-primary)]">
          Editar Contrato
        </h1>
        <Card padding="lg" className="border-red-200 dark:border-red-800">
          <p className="text-body text-red-600 dark:text-red-400">
            {loadError}
          </p>
          <Link href="/finance/contratos" className="mt-4 inline-block">
            <Button variant="secondary">Voltar</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-lg flex flex-wrap items-center gap-4">
        <Link
          href={`/finance/contratos/${id}`}
          className="inline-flex items-center gap-1 text-small font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Voltar
        </Link>
        <h1 className="text-h2 font-semibold text-[var(--text-primary)]">
          Editar contrato
        </h1>
      </div>

      <Card padding="lg" className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-small text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
              role="alert"
            >
              {submitError}
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
              htmlFor="status"
              className="mb-1 block text-small font-medium text-neutral-700 dark:text-neutral-300"
            >
              Status *
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600"
              required
            >
              <option value="active">Ativo</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
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

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Salvar
            </Button>
            <Link href={`/finance/contratos/${id}`}>
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
