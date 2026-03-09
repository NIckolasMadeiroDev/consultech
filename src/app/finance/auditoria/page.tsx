"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

type AuditEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string | null;
  metadata: unknown;
  createdAt: string;
};

const ENTITY_LABELS: Record<string, string> = {
  finance_transaction: "Movimentação",
  finance_cashbox: "Caixa",
  finance_category: "Categoria",
  finance_payment_method: "Forma de pagamento",
  finance_payable: "Conta a pagar",
  finance_receivable: "Conta a receber",
};

export default function FinanceAuditoriaPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/finance/audit?limit=100")
      .then((r) => {
        if (!r.ok) {
          throw new Error("Falha ao carregar.");
        }
        return r.json();
      })
      .then(setLogs)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-lg">
        <h1 className="text-h2 font-semibold text-[var(--text-primary)]">Auditoria</h1>
        <p className="mt-1 text-body text-[var(--text-secondary)]">
          Log de alterações no módulo financeiro: quem alterou e quando.
        </p>
      </div>

      {loading && (
        <Card padding="lg">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        </Card>
      )}

      {error && (
        <Card padding="lg" className="border-red-200 dark:border-red-800">
          <p className="text-body text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {!loading && !error && (
        <Card padding="none">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="mb-4 h-12 w-12 text-[var(--text-secondary)]" aria-hidden />
              <p className="text-body text-[var(--text-secondary)]">Nenhum registro de auditoria no módulo financeiro.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-small">
                <thead>
                  <tr className="border-b border-neutral-200 bg-[var(--surface)] dark:border-neutral-700">
                    <th className="p-lg font-medium text-[var(--text-primary)]">Data/Hora</th>
                    <th className="p-lg font-medium text-[var(--text-primary)]">Ação</th>
                    <th className="p-lg font-medium text-[var(--text-primary)]">Entidade</th>
                    <th className="p-lg font-medium text-[var(--text-primary)]">ID</th>
                    <th className="p-lg font-medium text-[var(--text-primary)]">Usuário</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-neutral-100 dark:border-neutral-800">
                      <td className="p-lg text-[var(--text-secondary)]">
                        {new Date(log.createdAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="p-lg font-medium text-[var(--text-primary)]">{log.action}</td>
                      <td className="p-lg text-[var(--text-secondary)]">{ENTITY_LABELS[log.entityType] ?? log.entityType}</td>
                      <td className="p-lg font-mono text-[var(--text-secondary)]">{log.entityId.slice(0, 8)}…</td>
                      <td className="p-lg text-[var(--text-secondary)]">{log.userId ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
