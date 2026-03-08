"use client";

import { useState, useEffect, useCallback } from "react";
import * as api from "@/lib/api";

export function useDashboards(userId?: string) {
  const [data, setData] = useState<Array<{ id: string; title: string; createdAt: string; formIds: string[] }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.fetchDashboards(undefined, userId);
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
