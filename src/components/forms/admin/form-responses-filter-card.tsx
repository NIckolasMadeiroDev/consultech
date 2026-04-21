"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FormResponsesFilterCard(props: {
  readonly filterStart: string;
  readonly filterEnd: string;
  readonly filterDepartment: string;
  readonly filterRespondent: string;
  readonly filterAnswer: string;
  readonly onChangeStart: (v: string) => void;
  readonly onChangeEnd: (v: string) => void;
  readonly onChangeDepartment: (v: string) => void;
  readonly onChangeRespondent: (v: string) => void;
  readonly onChangeAnswer: (v: string) => void;
  readonly onClear: () => void;
}) {
  const {
    filterStart,
    filterEnd,
    filterDepartment,
    filterRespondent,
    filterAnswer,
    onChangeStart,
    onChangeEnd,
    onChangeDepartment,
    onChangeRespondent,
    onChangeAnswer,
    onClear,
  } = props;

  return (
    <Card padding="lg">
      <p className="mb-3 text-small font-medium text-[var(--text-primary)]">Filtros</p>
      <p className="mb-3 text-caption text-[var(--text-secondary)]">
        O departamento filtra pelo campo do perfil do respondente quando existir. Para segmentar por uma pergunta
        (ex.: &quot;Departamento&quot;), use a busca no texto das respostas ou crie uma pergunta dedicada.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label htmlFor="f-start" className="mb-1 block text-caption text-[var(--text-secondary)]">
            Data inicial
          </label>
          <input
            id="f-start"
            type="date"
            value={filterStart}
            onChange={(e) => onChangeStart(e.target.value)}
            className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          />
        </div>
        <div>
          <label htmlFor="f-end" className="mb-1 block text-caption text-[var(--text-secondary)]">
            Data final
          </label>
          <input
            id="f-end"
            type="date"
            value={filterEnd}
            onChange={(e) => onChangeEnd(e.target.value)}
            className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          />
        </div>
        <Input
          id="f-dept"
          label="Departamento (perfil)"
          value={filterDepartment}
          onChange={(e) => onChangeDepartment(e.target.value)}
          placeholder="ex.: Marketing"
        />
        <Input
          id="f-resp"
          label="Respondente"
          value={filterRespondent}
          onChange={(e) => onChangeRespondent(e.target.value)}
          placeholder="Nome, e-mail…"
        />
        <Input
          id="f-ans"
          label="Texto nas respostas"
          value={filterAnswer}
          onChange={(e) => onChangeAnswer(e.target.value)}
        />
      </div>
      <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={onClear}>
        Limpar filtros
      </Button>
    </Card>
  );
}
