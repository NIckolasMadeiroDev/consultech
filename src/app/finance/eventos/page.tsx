"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Users, DollarSign } from "lucide-react";

type Event = {
  id: string;
  name: string;
  description: string | null;
  eventDate: string;
  status: string;
  scenariosCount: number;
  minCost: number;
  maxCost: number;
  createdAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  planning: "Planejamento",
  approved: "Aprovado",
  in_progress: "Em Andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  completed: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const url = filter !== "all" ? `/api/finance/events?status=${filter}` : "/api/finance/events";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erro ao carregar eventos");
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-display-sm font-semibold text-[var(--text-primary)]">
            Eventos
          </h1>
          <p className="text-body text-[var(--text-secondary)]">
            Planeje e gerencie eventos com múltiplos cenários de custo.
          </p>
        </div>
        <Link href="/finance/eventos/novo">
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            Novo Evento
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-primary-600 text-white"
              : "bg-neutral-100 text-[var(--text-secondary)] hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          }`}
        >
          Todos
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === key
                ? "bg-primary-600 text-white"
                : "bg-neutral-100 text-[var(--text-secondary)] hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <Card padding="lg" className="text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-[var(--text-secondary)]" />
          <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
            Nenhum evento encontrado
          </h3>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            {filter === "all"
              ? "Comece criando seu primeiro evento."
              : "Não há eventos com este status."}
          </p>
          <Link href="/finance/eventos/novo">
            <Button variant="primary">Criar Evento</Button>
          </Link>
        </Card>
      )}

      {/* Events Grid */}
      {!loading && events.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/finance/eventos/${event.id}`}>
              <Card
                padding="lg"
                className="h-full transition-all hover:border-primary-300 hover:shadow-md dark:hover:border-primary-700"
              >
                <div className="mb-md flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    {event.name}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      STATUS_COLORS[event.status]
                    }`}
                  >
                    {STATUS_LABELS[event.status]}
                  </span>
                </div>

                {event.description && (
                  <p className="mb-md line-clamp-2 text-sm text-[var(--text-secondary)]">
                    {event.description}
                  </p>
                )}

                <div className="space-y-2 border-t border-[var(--border)] pt-md">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(event.eventDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Users className="h-4 w-4" />
                    <span>
                      {event.scenariosCount}{" "}
                      {event.scenariosCount === 1 ? "cenário" : "cenários"}
                    </span>
                  </div>

                  {event.scenariosCount > 0 && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        R${" "}
                        {event.minCost.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        - R${" "}
                        {event.maxCost.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
