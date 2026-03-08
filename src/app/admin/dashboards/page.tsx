"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDashboards } from "@/hooks/useDashboards";
import * as api from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

export default function AdminDashboardsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const { data: dashboards, loading, error } = useDashboards(userId);
  const [title, setTitle] = useState("");
  const [formIds, setFormIds] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    const ids = formIds.split(/[\s,]+/).filter(Boolean);
    if (ids.length === 0) {
      setCreateError("Informe ao menos um ID de formulário.");
      return;
    }
    setCreating(true);
    try {
      const dash = await api.createDashboard({ title: title.trim() || "Dashboard", formIds: ids }, userId);
      router.push(`/admin/dashboards/${dash.id}`);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Erro");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <p className="text-slate-600">Carregando...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboards</h1>
      </div>
      <div className="mb-8 rounded border bg-white p-4">
        <h2 className="font-medium">Novo dashboard</h2>
        <form onSubmit={handleCreate} className="mt-2 flex flex-wrap items-end gap-2">
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded border px-3 py-2"
          />
          <input
            type="text"
            placeholder="IDs dos formulários (separados por vírgula)"
            value={formIds}
            onChange={(e) => setFormIds(e.target.value)}
            className="min-w-[200px] rounded border px-3 py-2"
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? "Criando..." : "Criar"}
          </button>
        </form>
        {createError && <p className="mt-2 text-sm text-red-600">{createError}</p>}
      </div>
      <ul className="space-y-3">
        {dashboards?.map((d) => (
          <li key={d.id} className="flex items-center justify-between rounded border bg-white p-4">
            <span className="font-medium">{d.title}</span>
            <Link
              href={`/admin/dashboards/${d.id}`}
              className="rounded border px-3 py-1 text-sm hover:bg-slate-100"
            >
              Ver
            </Link>
          </li>
        ))}
      </ul>
      {dashboards?.length === 0 && (
        <p className="text-slate-500">Nenhum dashboard. Crie um acima.</p>
      )}
    </div>
  );
}
