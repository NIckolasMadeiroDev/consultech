"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";

type ChartData = {
  label?: string;
  value?: number;
  month?: string;
  count?: number;
};

type CustomChartRendererProps = {
  chartId: string;
  chartType: "bar" | "line" | "pie";
  title: string;
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function CustomChartRenderer({
  chartId,
  chartType,
  title,
}: CustomChartRendererProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, [chartId]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      // Extract dashboardId from the URL or context
      // For now, we'll need to pass it or infer it
      const response = await fetch(`/api/dashboards/charts/${chartId}/data`);
      if (!response.ok) throw new Error("Erro ao carregar dados");
      const json = await response.json();
      setData(Array.isArray(json) ? json : []);
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card padding="lg">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card padding="lg">
        <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-[var(--text-secondary)]">
            Nenhum dado disponível para este gráfico.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
        {title}
      </h3>

      {chartType === "bar" && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="label"
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
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {chartType === "line" && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
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
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {chartType === "pie" && (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry) => `${entry.label}: ${entry.value}`}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
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
        </ResponsiveContainer>
      )}
    </Card>
  );
}
