"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = { id: string; name: string; type: string; parentId: string | null };

export default function EditarCategoriaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [name, setName] = useState("");
  const [type, setType] = useState<"entry" | "exit">("exit");
  const [parentId, setParentId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/finance/categories/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Categoria não encontrada.");
        return res.json();
      })
      .then((data) => {
        setName(data.name ?? "");
        setType(data.type === "entry" ? "entry" : "exit");
        setParentId(data.parentId ?? "");
      })
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Erro ao carregar."));
  }, [id]);

  useEffect(() => {
    fetch("/api/finance/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!name.trim()) {
      setSubmitError("Nome é obrigatório.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/finance/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type, parentId: parentId || null }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setSubmitError(data.error ?? "Erro ao atualizar.");
        setLoading(false);
        return;
      }
      router.push("/finance/categorias");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro ao salvar.");
      setLoading(false);
    }
  }

  const parentOptions = categories.filter((c) => c.type === type && c.id !== id);

  if (loadError) {
    return (
      <div>
        <h1 className="mb-lg text-h2 font-semibold text-[var(--text-primary)]">Editar categoria</h1>
        <Card padding="lg" className="border-red-200 dark:border-red-800">
          <p className="text-body text-red-600 dark:text-red-400">{loadError}</p>
          <Link href="/finance/categorias" className="mt-4 inline-block"><Button variant="secondary">Voltar</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-lg flex flex-wrap items-center gap-4">
        <Link href="/finance/categorias" className="inline-flex items-center gap-1 text-small font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-h2 font-semibold text-[var(--text-primary)]">Editar categoria</h1>
      </div>

      <Card padding="lg" className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-small text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200" role="alert">
              {submitError}
            </p>
          )}
          <Input id="name" label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
          <div>
            <label htmlFor="cat-type-edit" className="mb-1 block text-small font-medium text-neutral-700 dark:text-neutral-300">Tipo</label>
            <select
              id="cat-type-edit"
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
              <label htmlFor="cat-parent-edit" className="mb-1 block text-small font-medium text-neutral-700 dark:text-neutral-300">Subcategoria de (opcional)</label>
              <select
                id="cat-parent-edit"
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
