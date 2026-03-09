"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditarCaixaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/finance/cashboxes/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Caixa não encontrado.");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setName(data.name ?? "");
          setDescription(data.description ?? "");
          setIsActive(data.isActive !== false);
        }
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Erro ao carregar.");
      });
    return () => { cancelled = true; };
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!name.trim()) {
      setSubmitError("Nome é obrigatório.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/finance/cashboxes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          isActive,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setSubmitError(data.error ?? "Erro ao atualizar caixa.");
        setLoading(false);
        return;
      }
      router.push("/finance/caixas");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro ao salvar.");
      setLoading(false);
    }
  }

  if (loadError) {
    return (
      <div>
        <h1 className="mb-lg text-h2 font-semibold text-[var(--text-primary)]">Editar caixa</h1>
        <Card padding="lg" className="border-red-200 dark:border-red-800">
          <p className="text-body text-red-600 dark:text-red-400">{loadError}</p>
          <Link href="/finance/caixas" className="mt-4 inline-block">
            <Button variant="secondary">Voltar para Caixas</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-lg flex flex-wrap items-center gap-4">
        <Link
          href="/finance/caixas"
          className="inline-flex items-center gap-1 text-small font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Voltar
        </Link>
        <h1 className="text-h2 font-semibold text-[var(--text-primary)]">Editar caixa</h1>
      </div>

      <Card padding="lg" className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-small text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200" role="alert">
              {submitError}
            </p>
          )}
          <Input
            id="name"
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            id="description"
            label="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-small font-medium text-[var(--text-primary)]">
              Caixa ativo (inativo não aparece nas movimentações)
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} disabled={loading} leftIcon={<Save className="h-4 w-4" />}>
              Salvar
            </Button>
            <Link href="/finance/caixas">
              <Button type="button" variant="secondary">Cancelar</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
