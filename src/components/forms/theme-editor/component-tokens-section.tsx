"use client";

import type { FormThemeComponents, FormThemeFields } from "@/types/form-theme";

type ComponentTokensSectionProps = {
  readonly components: FormThemeComponents;
  readonly fields: FormThemeFields;
  readonly onComponentsChange: (next: FormThemeComponents) => void;
  readonly onFieldsChange: (next: FormThemeFields) => void;
};

export function ComponentTokensSection({
  components,
  fields,
  onComponentsChange,
  onFieldsChange,
}: ComponentTokensSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
          Raio SM
          <input
            type="text"
            value={components.borderRadiusSm}
            onChange={(e) => onComponentsChange({ ...components, borderRadiusSm: e.target.value })}
            className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          />
        </label>
        <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
          Raio MD
          <input
            type="text"
            value={components.borderRadiusMd}
            onChange={(e) => onComponentsChange({ ...components, borderRadiusMd: e.target.value })}
            className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          />
        </label>
        <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
          Raio LG
          <input
            type="text"
            value={components.borderRadiusLg}
            onChange={(e) => onComponentsChange({ ...components, borderRadiusLg: e.target.value })}
            className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
          Variante do botão
          <select
            value={components.buttonVariant}
            onChange={(e) =>
              onComponentsChange({
                ...components,
                buttonVariant: e.target.value as FormThemeComponents["buttonVariant"],
              })
            }
            className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          >
            <option value="filled">Preenchido</option>
            <option value="outline">Contorno</option>
            <option value="ghost">Fantasma</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
          Sombra do cartão
          <select
            value={components.cardShadow}
            onChange={(e) =>
              onComponentsChange({
                ...components,
                cardShadow: e.target.value as FormThemeComponents["cardShadow"],
              })
            }
            className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          >
            <option value="none">Nenhuma</option>
            <option value="sm">Pequena</option>
            <option value="md">Média</option>
            <option value="lg">Grande</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
          Espessura da borda do campo
          <input
            type="text"
            value={components.inputBorderWidth}
            onChange={(e) =>
              onComponentsChange({ ...components, inputBorderWidth: e.target.value })
            }
            className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          />
        </label>
        <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
          Densidade dos campos
          <select
            value={fields.density}
            onChange={(e) =>
              onFieldsChange({
                ...fields,
                density: e.target.value as FormThemeFields["density"],
              })
            }
            className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          >
            <option value="comfortable">Confortável</option>
            <option value="compact">Compacto</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
          Fundo do input
          <input
            type="text"
            value={fields.inputBackground}
            onChange={(e) =>
              onFieldsChange({ ...fields, inputBackground: e.target.value })
            }
            className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          />
        </label>
        <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
          Borda do input
          <input
            type="text"
            value={fields.inputBorder}
            onChange={(e) => onFieldsChange({ ...fields, inputBorder: e.target.value })}
            className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          />
        </label>
        <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
          Borda no foco
          <input
            type="text"
            value={fields.inputFocusBorder}
            onChange={(e) =>
              onFieldsChange({ ...fields, inputFocusBorder: e.target.value })
            }
            className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          />
        </label>
      </div>
    </div>
  );
}
