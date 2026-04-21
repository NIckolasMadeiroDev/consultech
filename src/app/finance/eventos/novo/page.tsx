"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

type Scenario = {
  scenarioName: string;
  membersCount: string;
  costPerMember: string;
  notes: string;
};

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [status, setStatus] = useState("planning");
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { scenarioName: "", membersCount: "", costPerMember: "", notes: "" },
  ]);

  const addScenario = () => {
    setScenarios([
      ...scenarios,
      { scenarioName: "", membersCount: "", costPerMember: "", notes: "" },
    ]);
  };

  const removeScenario = (index: number) => {
    if (scenarios.length > 1) {
      setScenarios(scenarios.filter((_, i) => i !== index));
    }
  };

  const updateScenario = (
    index: number,
    field: keyof Scenario,
    value: string
  ) => {
    const updated = [...scenarios];
    updated[index][field] = value;
    setScenarios(updated);
  };

  const calculateTotal = (scenario: Scenario): number => {
    const members = Number(scenario.membersCount) || 0;
    const cost = Number(scenario.costPerMember) || 0;
    return members * cost;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/finance/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          eventDate,
          status,
          scenarios: scenarios.map((s) => ({
            scenarioName: s.scenarioName,
            membersCount: Number(s.membersCount),
            costPerMember: Number(s.costPerMember),
            notes: s.notes || null,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(error.error || "Erro ao criar evento");
      }

      const data = await response.json();
      router.push(`/finance/eventos/${data.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao criar evento");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-lg">
      <div className="flex items-center gap-4">
        <Link href="/finance/eventos">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-display-sm font-semibold text-[var(--text-primary)]">
            Novo Evento
          </h1>
          <p className="text-body text-[var(--text-secondary)]">
            Crie um evento e adicione cenários de custo.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-lg">
        {/* Informações do Evento */}
        <Card padding="lg">
          <h2 className="mb-md text-lg font-semibold text-[var(--text-primary)]">
            Informações do Evento
          </h2>
          <div className="space-y-md">
            <Input
              id="name"
              label="Nome do Evento"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Retiro Anual 2026"
            />

            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium text-[var(--text-primary)]"
              >
                Descrição (opcional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-primary-500"
                placeholder="Descreva os detalhes do evento"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="eventDate"
                type="date"
                label="Data do Evento"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />

              <div>
                <label
                  htmlFor="status"
                  className="mb-1 block text-sm font-medium text-[var(--text-primary)]"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-primary-500"
                >
                  <option value="planning">Planejamento</option>
                  <option value="approved">Aprovado</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Cenários */}
        <Card padding="lg">
          <div className="mb-md flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Cenários de Custo
            </h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addScenario}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Adicionar Cenário
            </Button>
          </div>

          <div className="space-y-md">
            {scenarios.map((scenario, index) => (
              <div
                key={index}
                className="rounded-lg border border-[var(--border)] p-md"
              >
                <div className="mb-md flex items-center justify-between">
                  <h3 className="font-medium text-[var(--text-primary)]">
                    Cenário {index + 1}
                  </h3>
                  {scenarios.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeScenario(index)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Nome do Cenário"
                    value={scenario.scenarioName}
                    onChange={(e) =>
                      updateScenario(index, "scenarioName", e.target.value)
                    }
                    placeholder="Ex: Pessimista, Realista, Otimista"
                    required
                  />

                  <Input
                    label="Número de Membros"
                    type="number"
                    min="1"
                    value={scenario.membersCount}
                    onChange={(e) =>
                      updateScenario(index, "membersCount", e.target.value)
                    }
                    placeholder="0"
                    required
                  />

                  <Input
                    label="Custo por Membro (R$)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={scenario.costPerMember}
                    onChange={(e) =>
                      updateScenario(index, "costPerMember", e.target.value)
                    }
                    placeholder="0.00"
                    required
                  />

                  <div className="flex items-end">
                    <div className="w-full rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800">
                      <p className="text-xs text-[var(--text-secondary)]">
                        Custo Total
                      </p>
                      <p className="text-lg font-bold text-[var(--text-primary)]">
                        R${" "}
                        {calculateTotal(scenario).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-md">
                  <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={scenario.notes}
                    onChange={(e) =>
                      updateScenario(index, "notes", e.target.value)
                    }
                    rows={2}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-primary-500"
                    placeholder="Observações sobre este cenário"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/finance/eventos">
            <Button type="button" variant="secondary" disabled={loading}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Criando..." : "Criar Evento"}
          </Button>
        </div>
      </form>
    </div>
  );
}
