"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NovoCaixaPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Nome é obrigatório.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/finance/cashboxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar caixa.");
        setLoading(false);
        return;
      }
      router.push("/finance/caixas");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar.");
      setLoading(false);
    }
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
        <h1 className="text-h2 font-semibold text-[var(--text-primary)]">Novo caixa</h1>
      </div>

      <Card padding="lg" className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-small text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200" role="alert">
              {error}
            </p>
          )}
          <Input
            id="name"
            label="Nome"
            placeholder="Ex.: Caixa Principal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            id="description"
            label="Descrição (opcional)"
            placeholder="Ex.: Caixa do dia a dia"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
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
