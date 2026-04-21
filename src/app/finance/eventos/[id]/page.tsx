"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventFeasibilityCalculator } from "@/components/finance";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Trash2,
  Users,
  DollarSign,
} from "lucide-react";

type Scenario = {
  id: string;
  scenarioName: string;
  membersCount: number;
  costPerMember: number;
  totalCost: number;
  notes: string | null;
};

type Event = {
  id: string;
  name: string;
  description: string | null;
  eventDate: string;
  status: string;
  scenarios: Scenario[];
  createdAt: string;
  updatedAt: string;
};

type DashboardData = {
  balance: number;
  entriesMonth: number;
};

const STATUS_LABELS: Record<string, string> = {
  planning: "Planejamento",
  approved: "Aprovado",
  in_progress: "Em Andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [event, setEvent] = useState<Event | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      loadEvent(p.id);
      loadDashboardData();
    });
  }, []);

  const loadEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/finance/events/${eventId}`);
      if (!response.ok) throw new Error("Erro ao carregar evento");
      const data = await response.json();
      setEvent(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar evento");
      router.push("/finance/eventos");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const response = await fetch("/api/finance/dashboard");
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Tem certeza que deseja deletar o evento "${event?.name}"? Esta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/finance/events/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar evento");
      }

      router.push("/finance/eventos");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao deletar evento");
      setDeleting(false);
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

  if (!event) {
    return (
      <div className="text-center">
        <p className="text-[var(--text-secondary)]">Evento não encontrado</p>
      </div>
    );
  }

  const selectedScenario = event.scenarios.find((s) => s.scenarioName.toLowerCase().includes("realista")) || event.scenarios[0];

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/finance/eventos">
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
              {event.name}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Status: {STATUS_LABELS[event.status]}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/finance/eventos/${id}/editar`}>
            <Button variant="secondary" size="sm" leftIcon={<Edit className="h-4 w-4" />}>
              Editar
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            {deleting ? "Deletando..." : "Deletar"}
          </Button>
        </div>
      </div>

      {/* Event Info */}
      <Card padding="lg">
        <h2 className="mb-md text-lg font-semibold text-[var(--text-primary)]">
          Informações do Evento
        </h2>
        <div className="space-y-md">
          {event.description && (
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                Descrição
              </p>
              <p className="text-[var(--text-primary)]">{event.description}</p>
            </div>
          )}
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(event.eventDate).toLocaleDateString("pt-BR", {
                dateStyle: "long",
              })}
            </span>
          </div>
        </div>
      </Card>

      {/* Scenarios */}
      <Card padding="lg">
        <h2 className="mb-md text-lg font-semibold text-[var(--text-primary)]">
          Cenários de Custo
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[var(--border)]">
              <tr>
                <th className="pb-2 text-left text-sm font-medium text-[var(--text-secondary)]">
                  Cenário
                </th>
                <th className="pb-2 text-right text-sm font-medium text-[var(--text-secondary)]">
                  Membros
                </th>
                <th className="pb-2 text-right text-sm font-medium text-[var(--text-secondary)]">
                  Custo/Membro
                </th>
                <th className="pb-2 text-right text-sm font-medium text-[var(--text-secondary)]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {event.scenarios.map((scenario) => (
                <tr key={scenario.id} className="border-b border-[var(--border)]">
                  <td className="py-3">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {scenario.scenarioName}
                      </p>
                      {scenario.notes && (
                        <p className="text-sm text-[var(--text-secondary)]">
                          {scenario.notes}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-right text-[var(--text-primary)]">
                    <div className="flex items-center justify-end gap-1">
                      <Users className="h-4 w-4 text-[var(--text-secondary)]" />
                      {scenario.membersCount}
                    </div>
                  </td>
                  <td className="py-3 text-right text-[var(--text-primary)]">
                    R${" "}
                    {scenario.costPerMember.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign className="h-4 w-4 text-[var(--text-secondary)]" />
                      <span className="font-semibold text-[var(--text-primary)]">
                        R${" "}
                        {scenario.totalCost.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Feasibility Analysis */}
      {dashboardData && selectedScenario && (
        <EventFeasibilityCalculator
          totalCost={selectedScenario.totalCost}
          currentBalance={dashboardData.balance}
          averageMonthlyRevenue={dashboardData.entriesMonth}
        />
      )}
    </div>
  );
}
