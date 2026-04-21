"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type ChartData = {
  month: string;
  goal: number;
  achieved: number;
};

export function GoalVsAchievedChart({ months = 6 }: { months?: number }) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/finance/charts/goal-vs-achieved?months=${months}`)
      .then((r) => r.json())
      .then((json) => setData(Array.isArray(json) ? json : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [months]);

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center">
        <p className="text-body text-[var(--text-secondary)]">
          Nenhuma meta configurada para o período.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="month"
          stroke="var(--text-secondary)"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke="var(--text-secondary)"
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`}
        />
        <Tooltip
          formatter={(value) => [
            `R$ ${Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            "",
          ]}
          contentStyle={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Bar dataKey="goal" fill="#8b5cf6" name="Meta" radius={[4, 4, 0, 0]} />
        <Bar dataKey="achieved" fill="#10b981" name="Realizado" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
