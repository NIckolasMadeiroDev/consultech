"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import type { FormResponseAggregate } from "@/lib/api";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

function numericHistogram(samples: number[]): { label: string; value: number }[] {
  const freq = new Map<string, number>();
  for (const n of samples) {
    const k = String(Math.round(n * 100) / 100);
    freq.set(k, (freq.get(k) ?? 0) + 1);
  }
  return Array.from(freq.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => Number(a.label) - Number(b.label));
}

export function QuestionAggregateChart({ aggregate }: { aggregate: FormResponseAggregate }) {
  const structuredData = useMemo(() => {
    if (!aggregate.optionCounts) return [];
    return Object.entries(aggregate.optionCounts).map(([label, value]) => ({ label, value }));
  }, [aggregate.optionCounts]);

  const numericData = useMemo(() => {
    if (!aggregate.numericSamples?.length) return [];
    return numericHistogram(aggregate.numericSamples);
  }, [aggregate.numericSamples]);

  if (aggregate.total === 0) {
    return (
      <Card padding="md" className="border-dashed border-neutral-300 dark:border-neutral-600">
        <p className="text-caption text-[var(--text-secondary)]">
          Ainda não há respostas neste período para esta pergunta.
        </p>
      </Card>
    );
  }

  if (aggregate.empty === aggregate.total && !aggregate.optionCounts && !aggregate.numericSamples?.length) {
    return (
      <Card padding="md" className="border-dashed border-neutral-300 dark:border-neutral-600">
        <p className="text-caption text-[var(--text-secondary)]">
          Todas as respostas estão vazias ou o tipo de pergunta não suporta distribuição automática.
        </p>
      </Card>
    );
  }

  if (structuredData.length > 0) {
    const usePie = structuredData.length <= 8;
    return (
      <Card padding="md">
        <ResponsiveContainer width="100%" height={usePie ? 280 : 260}>
          {usePie ? (
            <PieChart>
              <Pie
                data={structuredData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(e: { label?: string; value?: number }) =>
                  `${e.label ?? ""}: ${e.value ?? 0}`
                }
              >
                {structuredData.map((_, index) => (
                  <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          ) : (
            <BarChart data={structuredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" stroke="var(--text-secondary)" style={{ fontSize: 11 }} />
              <YAxis stroke="var(--text-secondary)" style={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </Card>
    );
  }

  if (numericData.length > 0) {
    return (
      <Card padding="md">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={numericData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" stroke="var(--text-secondary)" style={{ fontSize: 11 }} />
            <YAxis stroke="var(--text-secondary)" style={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    );
  }

  if (aggregate.textSamples && aggregate.textSamples.length > 0) {
    return (
      <Card padding="md">
        <ul className="max-h-48 space-y-2 overflow-y-auto text-body text-[var(--text-primary)]">
          {aggregate.textSamples.map((t, i) => (
            <li key={i} className="rounded border border-neutral-200 px-2 py-1 text-small dark:border-neutral-700">
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-caption text-[var(--text-secondary)]">Amostra de respostas de texto (até 80).</p>
      </Card>
    );
  }

  return (
    <Card padding="md" className="border-dashed border-neutral-300 dark:border-neutral-600">
      <p className="text-caption text-[var(--text-secondary)]">
        Configure o tipo de pergunta (escolhas, escala ou texto) para ver uma distribuição ou amostra.
      </p>
    </Card>
  );
}
