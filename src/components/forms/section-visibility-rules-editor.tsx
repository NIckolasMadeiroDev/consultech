"use client";

import { Button } from "@/components/ui/button";
import type { SectionVisibilityRule } from "@/types/form-section-visibility";

type Option = { id: string; label: string };

export function SectionVisibilityRulesEditor(props: {
  readonly rules: SectionVisibilityRule[];
  readonly onChange: (next: SectionVisibilityRule[]) => void;
  readonly answerQuestions: Option[];
}) {
  const { rules, onChange, answerQuestions } = props;

  function addRule() {
    onChange([
      ...rules,
      {
        sectionTitle: "Geral",
        condition: { type: "respondent_department", op: "eq", value: "" },
      },
    ]);
  }

  function updateRule(index: number, next: SectionVisibilityRule) {
    onChange(rules.map((r, i) => (i === index ? next : r)));
  }

  function removeRule(index: number) {
    onChange(rules.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-700">
      <div>
        <p className="text-small font-medium text-[var(--text-primary)]">Secções condicionais</p>
        <p className="mt-1 text-caption text-[var(--text-secondary)]">
          Mostre uma secção só quando o departamento do respondente corresponder, ou quando outra pergunta tiver um
          valor. O título da secção deve coincidir com o título do marcador de secção no editor.
        </p>
      </div>
      {rules.map((rule, i) => (
        <div
          key={i}
          className="space-y-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
        >
          <label className="block text-caption text-[var(--text-secondary)]">
            Título da secção (como no formulário)
            <input
              type="text"
              value={rule.sectionTitle}
              onChange={(e) =>
                updateRule(i, { ...rule, sectionTitle: e.target.value })
              }
              className="mt-1 h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <label className="text-caption text-[var(--text-secondary)]">
              Condição
              <select
                className="ml-2 h-9 rounded-lg border border-neutral-300 bg-[var(--background)] px-2 text-body dark:border-neutral-600"
                value={rule.condition.type}
                onChange={(e) => {
                  const t = e.target.value;
                  if (t === "respondent_department") {
                    updateRule(i, {
                      ...rule,
                      condition: { type: "respondent_department", op: "eq", value: "" },
                    });
                  } else {
                    const qid = answerQuestions[0]?.id ?? "";
                    updateRule(i, {
                      ...rule,
                      condition: { type: "answer", questionId: qid, op: "eq", value: "" },
                    });
                  }
                }}
              >
                <option value="respondent_department">Departamento do respondente</option>
                <option value="answer">Resposta a uma pergunta</option>
              </select>
            </label>
          </div>
          {rule.condition.type === "respondent_department" ? (
            <div className="flex flex-wrap gap-2">
              <select
                className="h-9 rounded-lg border border-neutral-300 bg-[var(--background)] px-2 text-body dark:border-neutral-600"
                value={rule.condition.op}
                onChange={(e) => {
                  const c = rule.condition;
                  if (c.type !== "respondent_department") return;
                  updateRule(i, {
                    ...rule,
                    condition: {
                      type: "respondent_department",
                      op: e.target.value as "eq" | "contains",
                      value: c.value,
                    },
                  });
                }}
              >
                <option value="eq">Igual a</option>
                <option value="contains">Contém</option>
              </select>
              <input
                type="text"
                placeholder="ex.: Marketing"
                value={rule.condition.value}
                onChange={(e) => {
                  const c = rule.condition;
                  if (c.type !== "respondent_department") return;
                  updateRule(i, {
                    ...rule,
                    condition: {
                      type: "respondent_department",
                      op: c.op,
                      value: e.target.value,
                    },
                  });
                }}
                className="h-9 min-w-[12rem] flex-1 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
              />
            </div>
          ) : (
            (() => {
              const ac = rule.condition;
              if (ac.type !== "answer") return null;
              return (
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <select
                    className="h-9 rounded-lg border border-neutral-300 bg-[var(--background)] px-2 text-body dark:border-neutral-600"
                    value={ac.questionId}
                    onChange={(e) =>
                      updateRule(i, {
                        ...rule,
                        condition: {
                          type: "answer",
                          questionId: e.target.value,
                          op: ac.op,
                          value: ac.value,
                          values: ac.values,
                        },
                      })
                    }
                  >
                    {answerQuestions.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.label}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-9 rounded-lg border border-neutral-300 bg-[var(--background)] px-2 text-body dark:border-neutral-600"
                    value={ac.op}
                    onChange={(e) => {
                      const op = e.target.value as "eq" | "neq" | "in";
                      updateRule(i, {
                        ...rule,
                        condition:
                          op === "in"
                            ? {
                                type: "answer",
                                questionId: ac.questionId,
                                op: "in",
                                values: [],
                                value: undefined,
                              }
                            : {
                                type: "answer",
                                questionId: ac.questionId,
                                op,
                                value: "",
                                values: undefined,
                              },
                      });
                    }}
                  >
                    <option value="eq">Igual a</option>
                    <option value="neq">Diferente de</option>
                    <option value="in">Um de (lista)</option>
                  </select>
                  <input
                    type="text"
                    placeholder='Valor ou "a,b,c" para lista'
                    value={
                      ac.op === "in"
                        ? (ac.values ?? []).map(String).join(", ")
                        : String(ac.value ?? "")
                    }
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (ac.op === "in") {
                        const values = raw
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        updateRule(i, {
                          ...rule,
                          condition: {
                            type: "answer",
                            questionId: ac.questionId,
                            op: "in",
                            values,
                            value: undefined,
                          },
                        });
                      } else {
                        updateRule(i, {
                          ...rule,
                          condition: {
                            type: "answer",
                            questionId: ac.questionId,
                            op: ac.op,
                            value: raw,
                            values: undefined,
                          },
                        });
                      }
                    }}
                    className="h-9 min-w-[12rem] flex-1 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
                  />
                </div>
              );
            })()
          )}
          <Button type="button" variant="secondary" size="sm" onClick={() => removeRule(i)}>
            Remover regra
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={addRule}>
        Adicionar regra
      </Button>
    </div>
  );
}
