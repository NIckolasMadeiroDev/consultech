"use client";

import { useState, useEffect, useCallback } from "react";
import * as api from "@/lib/api";

export function useFormResponses(
  formId: string | null,
  userId?: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    respondentSearch?: string;
    answerSearch?: string;
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

  const refetch = useCallback(async () => {
    if (!formId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await api.fetchFormResponses(formId, userId, filters);
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [formId, userId, filters?.startDate, filters?.endDate, filters?.respondentSearch, filters?.answerSearch]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
