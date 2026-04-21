"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ChartData = {
  category: string;
  total: number;
};

export function ExpensesByCategoryChart({ months = 6 }: { months?: number }) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/finance/charts/expenses-by-category?months=${months}`)
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
          Nenhum gasto com categoria no período.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          type="number"
          stroke="var(--text-secondary)"
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`}
        />
        <YAxis
          type="category"
          dataKey="category"
          width={120}
          stroke="var(--text-secondary)"
          style={{ fontSize: "12px" }}
        />
        <Tooltip
          formatter={(value) => [
            `R$ ${Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            "Total",
          ]}
          contentStyle={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="total" fill="#ef4444" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
