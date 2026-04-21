"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  Mail,
  Building,
  Calendar,
  FileText,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Response = {
  id: string;
  form: {
    id: string;
    title: string;
  };
  submittedAt: string;
};

type Respondent = {
  id: string;
  name: string;
  email: string;
  employeeId: string | null;
  department: string | null;
  responseCount: number;
  createdAt: string;
  responses: Response[];
};

type EvolutionData = {
  month: string;
  count: number;
};

export default function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [member, setMember] = useState<Respondent | null>(null);
  const [evolution, setEvolution] = useState<EvolutionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => {
      loadMember(p.id);
      loadEvolution(p.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/respondents/${memberId}`);
      if (!response.ok) throw new Error("Erro ao carregar membro");
      const data = await response.json();
      setMember(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar dados do membro");
    } finally {
      setLoading(false);
    }
  };

  const loadEvolution = async (memberId: string) => {
    try {
      const response = await fetch(`/api/respondents/${memberId}/evolution`);
      if (response.ok) {
        const data = await response.json();
        setEvolution(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar evolução:", error);
    }
  };

  const getParticipationBadge = (count: number) => {
    if (count >= 10) {
      return {
        label: "Participativo",
        color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      };
    } else if (count >= 3) {
      return {
        label: "Ocasional",
        color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      };
    } else {
      return {
        label: "Inativo",
        color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
      };
    }
  };

  if (loading) {
    return (
      <div className="space-y-lg">
        <div className="h-8 w-64 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-64 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center">
        <p className="text-[var(--text-secondary)]">Membro não encontrado</p>
      </div>
    );
  }

  const badge = getParticipationBadge(member.responseCount);

  return (
    <div className="space-y-lg">
      <div className="flex items-center gap-4">
        <Link href="/admin/membros">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-display-sm font-semibold text-[var(--text-primary)]">
            {member.name}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Ficha Individual do Membro
          </p>
        </div>
      </div>

      {/* Member Info */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="lg">
          <div className="mb-md flex items-center justify-between border-b border-[var(--border)] pb-md">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Dados do Membro
            </h2>
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <div className="space-y-md">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-[var(--text-secondary)]" />
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Nome</p>
                <p className="font-medium text-[var(--text-primary)]">
                  {member.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[var(--text-secondary)]" />
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Email</p>
                <p className="font-medium text-[var(--text-primary)]">
                  {member.email}
                </p>
              </div>
            </div>

            {member.department && (
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-[var(--text-secondary)]" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Departamento
                  </p>
                  <p className="font-medium text-[var(--text-primary)]">
                    {member.department}
                  </p>
                </div>
              </div>
            )}

            {member.employeeId && (
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[var(--text-secondary)]" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    ID do Funcionário
                  </p>
                  <p className="font-medium text-[var(--text-primary)]">
                    {member.employeeId}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[var(--text-secondary)]" />
              <div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Membro desde
                </p>
                <p className="font-medium text-[var(--text-primary)]">
                  {new Date(member.createdAt).toLocaleDateString("pt-BR", {
                    dateStyle: "long",
                  })}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <Card padding="lg">
          <div className="mb-md flex items-center gap-3 border-b border-[var(--border)] pb-md">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Estatísticas
            </h2>
          </div>
          <div className="space-y-md">
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Total de Respostas
              </p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                {member.responseCount}
              </p>
            </div>

            {evolution.length > 0 && (
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <p className="text-sm text-green-700 dark:text-green-400">
                  Respostas no Último Mês
                </p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {evolution[evolution.length - 1]?.count || 0}
                </p>
              </div>
            )}

            <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <p className="text-sm text-purple-700 dark:text-purple-400">
                Formulários Distintos
              </p>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                {new Set(member.responses.map((r) => r.form.id)).size}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Evolution Chart */}
      {evolution.length > 0 && (
        <Card padding="lg">
          <h2 className="mb-md text-lg font-semibold text-[var(--text-primary)]">
            Evolução de Participação (Últimos 12 Meses)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                stroke="var(--text-secondary)"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="var(--text-secondary)"
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Respostas"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Response History */}
      <Card padding="lg">
        <h2 className="mb-md text-lg font-semibold text-[var(--text-primary)]">
          Histórico de Respostas
        </h2>
        {member.responses.length === 0 ? (
          <p className="text-center text-sm text-[var(--text-secondary)]">
            Nenhuma resposta registrada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="pb-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                    Formulário
                  </th>
                  <th className="pb-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                    Data de Envio
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {member.responses.map((response) => (
                  <tr key={response.id}>
                    <td className="py-3">
                      <Link
                        href={`/admin/forms/${response.form.id}/responses`}
                        className="font-medium text-primary-600 hover:underline dark:text-primary-400"
                      >
                        {response.form.title}
                      </Link>
                    </td>
                    <td className="py-3 text-right text-sm text-[var(--text-secondary)]">
                      {new Date(response.submittedAt).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
