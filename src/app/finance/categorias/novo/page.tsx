"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = { id: string; name: string; type: string; parentId: string | null };

export default function NovaCategoriaPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<"entry" | "exit">("exit");
  const [parentId, setParentId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/finance/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Nome é obrigatório.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/finance/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          parentId: parentId || null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar categoria.");
        setLoading(false);
        return;
      }
      router.push("/finance/categorias");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar.");
      setLoading(false);
    }
  }

  const parentOptions = categories.filter((c) => c.type === type);

  return (
    <div>
      <div className="mb-lg flex flex-wrap items-center gap-4">
        <Link href="/finance/categorias" className="inline-flex items-center gap-1 text-small font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-h2 font-semibold text-[var(--text-primary)]">Nova categoria</h1>
      </div>

      <Card padding="lg" className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-small text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200" role="alert">
              {error}
            </p>
          )}
          <Input id="name" label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
          <div>
            <label htmlFor="cat-type" className="mb-1 block text-small font-medium text-neutral-700 dark:text-neutral-300">Tipo</label>
            <select
              id="cat-type"
              value={type}
              onChange={(e) => setType(e.target.value as "entry" | "exit")}
              className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600"
            >
              <option value="entry">Receita</option>
              <option value="exit">Despesa</option>
            </select>
          </div>
          {parentOptions.length > 0 && (
            <div>
              <label htmlFor="cat-parent" className="mb-1 block text-small font-medium text-neutral-700 dark:text-neutral-300">Subcategoria de (opcional)</label>
              <select
                id="cat-parent"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600"
              >
                <option value="">Nenhuma (categoria raiz)</option>
                {parentOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} disabled={loading} leftIcon={<Save className="h-4 w-4" />}>Salvar</Button>
            <Link href="/finance/categorias"><Button type="button" variant="secondary">Cancelar</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
