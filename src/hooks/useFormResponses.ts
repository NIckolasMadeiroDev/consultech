"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as api from "@/lib/api";

export function useFormResponses(
  formId: string | null,
  userId?: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    respondentSearch?: string;
    answerSearch?: string;
    department?: string;
  }
) {
  const [data, setData] = useState<Array<{
    id: string;
    submittedAt: string;
    respondent: { name: string; email: string; employeeId?: string; department?: string } | null;
    answers: Array<{ questionId: string; value: unknown }>;
  }> | null>(null);
  const [loading, setLoading] = useState(!!formId);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify({
    a: filters?.answerSearch,
    d: filters?.department,
    e: filters?.endDate,
    r: filters?.respondentSearch,
    s: filters?.startDate,
  });

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const refetch = useCallback(async () => {
    if (!formId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await api.fetchFormResponses(formId, userId, filtersRef.current);
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [formId, userId]);

  useEffect(() => {
    void refetch();
  }, [refetch, filtersKey]);

  return { data, loading, error, refetch };
}
