"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderTree, Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/finance";
import { useFinanceAccess } from "@/contexts/finance-access-context";

type Category = {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
};

function buildTree(categories: Category[]) {
  const byParent = new Map<string | null, Category[]>();
  for (const c of categories) {
    const key = c.parentId ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  }
  function children(parentId: string | null): Category[] {
    return byParent.get(parentId) ?? [];
  }
  return { children };
}

type CategoryRowProps = Readonly<{
  c: Category;
  depth: number;
  tree: ReturnType<typeof buildTree>;
  onDelete: (id: string) => void;
}>;

function CategoryRow({ c, depth, tree, onDelete }: CategoryRowProps) {
  const { mode } = useFinanceAccess();
  return (
    <>
      <tr className="border-b border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50">
        <td className="p-lg font-medium text-[var(--text-primary)]" style={{ paddingLeft: depth ? `${16 + depth * 20}px` : undefined }}>
          {depth > 0 && <span className="text-neutral-400">↳ </span>}
          {c.name}
        </td>
        <td className="p-lg">
          <CategoryBadge label={c.type === "entry" ? "Receita" : "Despesa"} variant={c.type === "entry" ? "entry" : "exit"} />
        </td>
        <td className="p-lg">
          {mode === "admin" && (
            <>
              <Link href={`/finance/categorias/${c.id}/editar`} className="mr-2 inline-flex items-center gap-1 text-small text-primary-600 hover:underline">
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Link>
              <button type="button" onClick={() => onDelete(c.id)} className="inline-flex items-center gap-1 text-small text-red-600 hover:underline">
                <Trash2 className="h-3.5 w-3.5" /> Excluir
              </button>
            </>
          )}
        </td>
      </tr>
      {tree.children(c.id).map((child) => (
        <CategoryRow key={child.id} c={child} depth={depth + 1} tree={tree} onDelete={onDelete} />
      ))}
    </>
  );
}

export default function FinanceCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { mode } = useFinanceAccess();

  const load = () => {
    fetch("/api/finance/categories")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Falha ao carregar.");
        }
        return res.json();
      })
      .then(setCategories)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (mode === "visitor") return;
    if (!confirm("Excluir esta categoria?")) return;
    const res = await fetch(`/api/finance/categories/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error ?? "Erro ao excluir.");
      return;
    }
    load();
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-lg text-h2 font-semibold text-[var(--text-primary)]">Categorias</h1>
        <div className="h-48 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-lg text-h2 font-semibold text-[var(--text-primary)]">Categorias</h1>
        <Card padding="lg" className="border-red-200 dark:border-red-800">
          <p className="text-body text-red-600 dark:text-red-400">{error}</p>
          <button type="button" className="mt-4 text-small font-medium text-primary-600 hover:underline" onClick={() => globalThis.location.reload()}>
            Tentar novamente
          </button>
        </Card>
      </div>
    );
  }

  const tree = buildTree(categories);

  const roots = tree.children(null);

  return (
    <div>
      <div className="mb-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-semibold text-[var(--text-primary)]">Categorias</h1>
          <p className="mt-1 text-body text-[var(--text-secondary)]">
            Categorias e subcategorias de receitas e despesas para classificar movimentações.
          </p>
        </div>
        {mode === "admin" && (
          <Link href="/finance/categorias/novo">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Nova categoria</Button>
          </Link>
        )}
      </div>

      {categories.length === 0 ? (
        <Card padding="lg" className="border-dashed border-neutral-300 dark:border-neutral-600">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FolderTree className="mb-4 h-12 w-12 text-[var(--text-secondary)]" aria-hidden />
            <p className="text-body text-[var(--text-secondary)]">
              Nenhuma categoria cadastrada. Cadastre categorias para usar em entradas e saídas.
            </p>
            {mode === "admin" && (
              <Link href="/finance/categorias/novo" className="mt-4">
                <Button variant="primary">Nova categoria</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead>
                <tr className="border-b border-neutral-200 bg-[var(--surface)] dark:border-neutral-700">
                  <th className="p-lg font-medium text-[var(--text-primary)]">Nome</th>
                  <th className="p-lg font-medium text-[var(--text-primary)]">Tipo</th>
                  <th className="p-lg font-medium text-[var(--text-primary)]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {roots.map((c) => (
                  <CategoryRow key={c.id} c={c} depth={0} tree={tree} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
