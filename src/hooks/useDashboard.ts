"use client";

import { useState, useEffect, useCallback } from "react";
import * as api from "@/lib/api";

export function useDashboard(id: string | null) {
  const [data, setData] = useState<{
    id: string;
    title: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    formIds: string[];
  } | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const dash = await api.fetchDashboard(id);
      setData(dash);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
