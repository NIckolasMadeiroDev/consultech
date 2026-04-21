"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFormResponses } from "@/hooks/useFormResponses";
import * as api from "@/lib/api";
import { useToast } from "@/contexts/toast-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { acceptsAnswerValue } from "@/lib/form-question-kinds";
import { FormResponsesFilterCard } from "./form-responses-filter-card";
import { FormResponsesSubmissionTab } from "./form-responses-submission-tab";
import { FormResponsesQuestionTab } from "./form-responses-question-tab";
import { FormResponsesTableTab } from "./form-responses-table-tab";

type TabId = "submission" | "question" | "table";

export function FormResponsesAdmin(props: { readonly formId: string; readonly userId: string }) {
  const { formId, userId } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useToast();

  const initialTab = (searchParams.get("view") as TabId) || "submission";
  const [tab, setTab] = useState<TabId>(
    initialTab === "question" || initialTab === "table" ? initialTab : "submission"
  );
  const [filterStart, setFilterStart] = useState(searchParams.get("startDate") ?? "");
  const [filterEnd, setFilterEnd] = useState(searchParams.get("endDate") ?? "");
  const [filterRespondent, setFilterRespondent] = useState(searchParams.get("respondentSearch") ?? "");
  const [filterAnswer, setFilterAnswer] = useState(searchParams.get("answerSearch") ?? "");
  const [filterDepartment, setFilterDepartment] = useState(searchParams.get("department") ?? "");
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(
    searchParams.get("response") ?? null
  );
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      startDate: filterStart || undefined,
      endDate: filterEnd || undefined,
      respondentSearch: filterRespondent.trim() || undefined,
      answerSearch: filterAnswer.trim() || undefined,
      department: filterDepartment.trim() || undefined,
    }),
    [filterStart, filterEnd, filterRespondent, filterAnswer, filterDepartment]
  );

  const { data: responses, loading, error, refetch } = useFormResponses(formId, userId, filters);
  const [questions, setQuestions] = useState<
    Array<{
      id: string;
      text: string;
      type: string;
      orderIndex: number;
      sectionTitle?: string | null;
    }>
  >([]);
  const [aggregates, setAggregates] = useState<api.FormResponseAggregate[] | null>(null);
  const [aggLoading, setAggLoading] = useState(false);

  useEffect(() => {
    void api.fetchForm(formId).then((f) => {
      const qs = (f as { questions?: typeof questions }).questions ?? [];
      setQuestions(
        qs.map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          orderIndex: q.orderIndex,
          sectionTitle: (q as { sectionTitle?: string | null }).sectionTitle ?? null,
        }))
      );
      const firstAns = qs.find((q) => acceptsAnswerValue(q.type));
      setSelectedQuestionId((prev) => prev ?? firstAns?.id ?? null);
    });
  }, [formId]);

  useEffect(() => {
    const usp = new URLSearchParams();
    if (filterStart) usp.set("startDate", filterStart);
    if (filterEnd) usp.set("endDate", filterEnd);
    if (filterRespondent.trim()) usp.set("respondentSearch", filterRespondent.trim());
    if (filterAnswer.trim()) usp.set("answerSearch", filterAnswer.trim());
    if (filterDepartment.trim()) usp.set("department", filterDepartment.trim());
    if (tab !== "submission") usp.set("view", tab);
    if (selectedResponseId) usp.set("response", selectedResponseId);
    const q = usp.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [
    filterStart,
    filterEnd,
    filterRespondent,
    filterAnswer,
    filterDepartment,
    tab,
    selectedResponseId,
    pathname,
    router,
  ]);

  const loadAggregates = useCallback(async () => {
    setAggLoading(true);
    try {
      const r = await api.fetchFormResponsesAggregate(formId, userId, filters);
      setAggregates(r.aggregates);
    } catch {
      toast("Não foi possível carregar agregados.", "error");
    } finally {
      setAggLoading(false);
    }
  }, [formId, userId, filters, toast]);

  useEffect(() => {
    if (tab === "question") void loadAggregates();
  }, [tab, loadAggregates]);

  const list = Array.isArray(responses) ? responses : [];
  const sortedQs = useMemo(() => [...questions].sort((a, b) => a.orderIndex - b.orderIndex), [questions]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col items-center justify-center py-12" padding="lg">
        <p className="text-body text-[var(--text-secondary)]">{error}</p>
        <Button className="mt-6" variant="primary" type="button" onClick={() => void refetch()}>
          Tentar novamente
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-lg">
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3 dark:border-neutral-700">
        {(
          [
            ["submission", "Por submissão"],
            ["question", "Por pergunta"],
            ["table", "Tabela"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-lg px-3 py-2 text-small font-medium transition-colors ${
              tab === id
                ? "bg-primary-600 text-white"
                : "bg-neutral-100 text-[var(--text-secondary)] hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <FormResponsesFilterCard
        filterStart={filterStart}
        filterEnd={filterEnd}
        filterDepartment={filterDepartment}
        filterRespondent={filterRespondent}
        filterAnswer={filterAnswer}
        onChangeStart={setFilterStart}
        onChangeEnd={setFilterEnd}
        onChangeDepartment={setFilterDepartment}
        onChangeRespondent={setFilterRespondent}
        onChangeAnswer={setFilterAnswer}
        onClear={() => {
          setFilterStart("");
          setFilterEnd("");
          setFilterDepartment("");
          setFilterRespondent("");
          setFilterAnswer("");
        }}
      />

      {tab === "submission" && (
        <FormResponsesSubmissionTab
          list={list}
          questions={questions}
          selectedResponseId={selectedResponseId}
          onSelectResponse={setSelectedResponseId}
        />
      )}

      {tab === "question" && (
        <FormResponsesQuestionTab
          loading={aggLoading}
          aggregates={aggregates}
          sortedQuestions={sortedQs}
          selectedQuestionId={selectedQuestionId}
          onSelectQuestion={setSelectedQuestionId}
        />
      )}

      {tab === "table" && <FormResponsesTableTab list={list} sortedQuestions={sortedQs} />}

      <p className="text-caption text-[var(--text-secondary)]">
        Use os botões de exportação no topo da página para CSV, Excel ou JSON.
      </p>
    </div>
  );
}
