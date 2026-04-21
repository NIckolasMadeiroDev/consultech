"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoneyValue } from "@/components/finance";

type Receivable = {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
  receivedAt: string | null;
};

type ContractDetails = {
  id: string;
  contractNumber: string;
  clientName: string | null;
  totalValue: number;
  startDate: string;
  endDate: string | null;
  status: string;
  description: string | null;
  receivables: Receivable[];
};

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export default function ContratoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [contract, setContract] = useState<ContractDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/finance/contracts/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Contrato não encontrado");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setContract(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/finance/contracts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao deletar contrato");
      router.push("/finance/contratos");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar");
      setDeleting(false);
      setDeleteModal(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-lg text-h2 font-semibold text-[var(--text-primary)]">
          Carregando...
        </h1>
        <Card padding="lg">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        </Card>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div>
        <h1 className="mb-lg text-h2 font-semibold text-[var(--text-primary)]">
          Detalhes do Contrato
        </h1>
        <Card padding="lg" className="border-red-200 dark:border-red-800">
          <p className="text-body text-red-600 dark:text-red-400">
            {error || "Contrato não encontrado"}
          </p>
          <Link href="/finance/contratos" className="mt-4 inline-block">
            <Button variant="secondary">Voltar</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const totalReceived = contract.receivables
    .filter((r) => r.status === "received")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalPending = contract.receivables
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.amount, 0);

  const progressPercent =
    contract.totalValue > 0 ? (totalReceived / contract.totalValue) * 100 : 0;

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
        <h1 className="flex-1 text-h2 font-semibold text-[var(--text-primary)]">
          {contract.contractNumber}
        </h1>
        <span
          className={`rounded-full px-3 py-1 text-small font-medium ${
            STATUS_COLORS[contract.status]
          }`}
        >
          {STATUS_LABELS[contract.status]}
        </span>
      </div>

      <div className="mb-lg grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="md">
          <p className="mb-1 text-small text-[var(--text-secondary)]">
            Valor Total
          </p>
          <MoneyValue
            value={contract.totalValue}
            variant="neutral"
            size="dashboard"
          />
        </Card>
        <Card padding="md">
          <p className="mb-1 text-small text-[var(--text-secondary)]">
            Recebido
          </p>
          <MoneyValue value={totalReceived} variant="entry" size="dashboard" />
        </Card>
        <Card padding="md">
          <p className="mb-1 text-small text-[var(--text-secondary)]">
            Pendente
          </p>
          <MoneyValue value={totalPending} variant="exit" size="dashboard" />
        </Card>
        <Card padding="md">
          <p className="mb-1 text-small text-[var(--text-secondary)]">
            Progresso
          </p>
          <p className="text-h3 font-semibold text-[var(--text-primary)]">
            {Math.round(progressPercent)}%
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div
              className="h-full rounded-full bg-primary-600 transition-all"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </Card>
      </div>

      <Card padding="lg" className="mb-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h4 font-semibold text-[var(--text-primary)]">
            Informações do Contrato
          </h2>
          <div className="flex gap-2">
            <Link href={`/finance/contratos/${id}/editar`}>
              <Button variant="secondary" leftIcon={<Edit className="h-4 w-4" />}>
                Editar
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => setDeleteModal(true)}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Deletar
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {contract.clientName && (
            <div>
              <p className="text-small font-medium text-[var(--text-secondary)]">
                Cliente
              </p>
              <p className="text-body text-[var(--text-primary)]">
                {contract.clientName}
              </p>
            </div>
          )}
          <div>
            <p className="text-small font-medium text-[var(--text-secondary)]">
              Data de Início
            </p>
            <p className="text-body text-[var(--text-primary)]">
              {new Date(contract.startDate).toLocaleDateString("pt-BR")}
            </p>
          </div>
          {contract.endDate && (
            <div>
              <p className="text-small font-medium text-[var(--text-secondary)]">
                Data de Término
              </p>
              <p className="text-body text-[var(--text-primary)]">
                {new Date(contract.endDate).toLocaleDateString("pt-BR")}
              </p>
            </div>
          )}
          {contract.description && (
            <div className="sm:col-span-2">
              <p className="text-small font-medium text-[var(--text-secondary)]">
                Descrição
              </p>
              <p className="text-body text-[var(--text-primary)]">
                {contract.description}
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="mb-4 text-h4 font-semibold text-[var(--text-primary)]">
          Contas a Receber Vinculadas ({contract.receivables.length})
        </h2>

        {contract.receivables.length === 0 ? (
          <p className="py-8 text-center text-body text-[var(--text-secondary)]">
            Nenhuma conta a receber vinculada a este contrato.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead>
                <tr className="border-b border-neutral-200 bg-[var(--surface)] dark:border-neutral-700">
                  <th className="p-lg font-medium text-[var(--text-primary)]">
                    Status
                  </th>
                  <th className="p-lg font-medium text-[var(--text-primary)]">
                    Descrição
                  </th>
                  <th className="p-lg font-medium text-[var(--text-primary)]">
                    Vencimento
                  </th>
                  <th className="p-lg text-right font-medium text-[var(--text-primary)]">
                    Valor
                  </th>
                  <th className="p-lg font-medium text-[var(--text-primary)]">
                    Recebido em
                  </th>
                </tr>
              </thead>
              <tbody>
                {contract.receivables.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
                  >
                    <td className="p-lg">
                      {r.status === "received" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : r.status === "cancelled" ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" />
                      )}
                    </td>
                    <td className="p-lg font-medium text-[var(--text-primary)]">
                      {r.description}
                    </td>
                    <td className="p-lg text-[var(--text-secondary)]">
                      {new Date(r.dueDate).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-lg text-right font-mono">
                      <MoneyValue
                        value={r.amount}
                        variant={r.status === "received" ? "entry" : "neutral"}
                        size="table"
                      />
                    </td>
                    <td className="p-lg text-[var(--text-secondary)]">
                      {r.receivedAt
                        ? new Date(r.receivedAt).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card padding="lg" className="max-w-md">
            <h3 className="mb-2 text-h4 font-semibold text-[var(--text-primary)]">
              Confirmar Exclusão
            </h3>
            <p className="mb-4 text-body text-[var(--text-secondary)]">
              Tem certeza que deseja deletar o contrato{" "}
              <strong>{contract.contractNumber}</strong>? Esta ação não pode ser
              desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeleteModal(false)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleDelete}
                loading={deleting}
                disabled={deleting}
              >
                Deletar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
