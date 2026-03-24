"use client";

import { useState, useEffect, useCallback } from "react";
import * as api from "@/lib/api";

export type FormDetail = {
  id: string;
  title: string;
  description?: string;
  closingMessage?: string;
  pausedMessage?: string;
  folderId?: string;
  folder?: string;
  isTemplate?: boolean;
  allowAnonymous?: boolean;
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
};

export function useForm(id: string | null) {
  const [data, setData] = useState<FormDetail | null>(null);
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
      const form = (await api.fetchForm(id)) as FormDetail;
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
