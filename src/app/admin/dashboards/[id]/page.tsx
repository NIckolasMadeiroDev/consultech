"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: dashboard, loading, error } = useDashboard(id);

  if (loading) return <p className="text-slate-600">Carregando...</p>;
  if (error || !dashboard) {
    return (
      <div>
        <p className="text-red-600">{error ?? "Dashboard não encontrado."}</p>
        <Link href="/admin/dashboards" className="mt-4 inline-block text-blue-600 hover:underline">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/dashboards" className="text-slate-600 hover:underline">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold">{dashboard.title}</h1>
      </div>
      <div className="rounded border bg-white p-4">
        <h2 className="font-medium">Formulários vinculados</h2>
        <ul className="mt-2 list-inside list-disc">
          {dashboard.formIds.map((formId) => (
            <li key={formId}>
              <Link
                href={`/admin/forms/${formId}/responses`}
                className="text-blue-600 hover:underline"
              >
                {formId}
              </Link>
            </li>
          ))}
        </ul>
        {dashboard.formIds.length === 0 && (
          <p className="text-slate-500">Nenhum formulário vinculado.</p>
        )}
      </div>
    </div>
  );
}
