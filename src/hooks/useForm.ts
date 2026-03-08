"use client";

import { useState, useEffect, useCallback } from "react";
import * as api from "@/lib/api";

export function useForm(id: string | null) {
  const [data, setData] = useState<{
    id: string;
    title: string;
    description?: string;
    status: string;
    questions: Array<{
      id: string;
      type: string;
      text: string;
      required: boolean;
      orderIndex: number;
      options?: string[];
      scaleMin?: number;
      scaleMax?: number;
    }>;
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
      const form = await api.fetchForm(id);
      setData(form);
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
