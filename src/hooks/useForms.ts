"use client";

import { useState, useEffect, useCallback } from "react";
import * as api from "@/lib/api";

export function useForms(userId?: string) {
  const [data, setData] = useState<Array<{ id: string; title: string; status: string; createdAt: string }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.fetchForms(undefined, userId);
      setData(list);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
