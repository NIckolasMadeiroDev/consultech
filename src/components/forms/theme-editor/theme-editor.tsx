"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { FormTheme } from "@/types/form-theme";
import { FormThemeEffectsSection } from "./form-theme-effects-section";
import { TemplateSelector } from "./template-selector";
import { ThemeAppearanceControls } from "./theme-appearance-controls";
import { ThemeExperienceSection } from "./theme-experience-section";

const tabLoading = () => (
  <p className="py-4 text-small text-[var(--text-secondary)]">A carregar…</p>
);

const ColorPickerSection = dynamic(
  () => import("./color-picker-section").then((m) => ({ default: m.ColorPickerSection })),
  { loading: tabLoading }
);
const TypographySection = dynamic(
  () => import("./typography-section").then((m) => ({ default: m.TypographySection })),
  { loading: tabLoading }
);
const LayoutCanvasSection = dynamic(
  () => import("./layout-canvas-section").then((m) => ({ default: m.LayoutCanvasSection })),
  { loading: tabLoading }
);
const ComponentTokensSection = dynamic(
  () => import("./component-tokens-section").then((m) => ({ default: m.ComponentTokensSection })),
  { loading: tabLoading }
);
const ImagesSection = dynamic(
  () => import("./images-section").then((m) => ({ default: m.ImagesSection })),
  { loading: tabLoading }
);
const FormThemeContentFields = dynamic(
  () => import("./form-theme-content-fields").then((m) => ({ default: m.FormThemeContentFields })),
  { loading: tabLoading }
);

type TabId =
  | "colors"
  | "typography"
  | "layout"
  | "components"
  | "effects"
  | "images"
  | "content"
  | "experience"
  | "advanced";

const TABS: { id: TabId; label: string; hint: string }[] = [
  { id: "colors", label: "Cores", hint: "Paleta principal, texto, bordas e estados de foco." },
  { id: "typography", label: "Tipografia", hint: "Fontes, pesos e tamanho base do formulário." },
  { id: "layout", label: "Layout e largura", hint: "Largura do conteúdo, alinhamento e espaçamentos." },
  { id: "components", label: "Componentes", hint: "Raios de borda, sombras e campos." },
  { id: "effects", label: "Efeitos", hint: "Sobreposição e desfocagem do fundo." },
  { id: "images", label: "Imagens", hint: "Cabeçalho, logótipo e imagem de fundo." },
  { id: "content", label: "Textos", hint: "Mensagens de boas-vindas, botão e página de sucesso." },
  { id: "experience", label: "Experiência", hint: "Animações, barra de progresso, navegação e larguras de preview." },
  { id: "advanced", label: "Avançado", hint: "Modelos pré-definidos e aparência claro/escuro." },
];

export type ThemeEditorProps = {
  readonly theme: FormTheme;
  readonly onThemeChange: (next: FormTheme) => void;
  readonly welcomeMessage: string;
  readonly submitButtonText: string;
  readonly successMessage: string;
  readonly successPageHtml: string;
  readonly successRedirectUrl: string;
  readonly successRedirectDelay: number;
  readonly onWelcomeChange: (v: string) => void;
  readonly onSubmitLabelChange: (v: string) => void;
  readonly onSuccessChange: (v: string) => void;
  readonly onSuccessPageHtmlChange: (v: string) => void;
  readonly onSuccessRedirectUrlChange: (v: string) => void;
  readonly onSuccessRedirectDelayChange: (v: number) => void;
  readonly headerImage: string | null;
  readonly logoImage: string | null;
  readonly backgroundImage: string | null;
  readonly onUploadHeader: (file: File) => Promise<void>;
  readonly onUploadLogo: (file: File) => Promise<void>;
  readonly onUploadBackground: (file: File) => Promise<void>;
  readonly onClearHeader: () => void;
  readonly onClearLogo: () => void;
  readonly onClearBackground: () => void;
};

export function ThemeEditor(props: ThemeEditorProps) {
  const [tab, setTab] = useState<TabId>("colors");
  const { theme, onThemeChange } = props;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b border-neutral-200 pb-2 dark:border-neutral-700">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.hint}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-small font-medium ${
              tab === t.id
                ? "bg-primary-600 text-white"
                : "text-[var(--text-secondary)] hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "colors" ? (
        <ColorPickerSection colors={theme.colors} onChange={(c) => onThemeChange({ ...theme, colors: c })} />
      ) : null}
      {tab === "typography" ? (
        <TypographySection
          typography={theme.typography}
          onChange={(typography) => onThemeChange({ ...theme, typography })}
        />
      ) : null}
      {tab === "layout" ? (
        <LayoutCanvasSection
          layout={theme.layout}
          onChange={(layout) => onThemeChange({ ...theme, layout })}
        />
      ) : null}
      {tab === "components" ? (
        <ComponentTokensSection
          components={theme.components}
          fields={theme.fields}
          onComponentsChange={(components) => onThemeChange({ ...theme, components })}
          onFieldsChange={(fields) => onThemeChange({ ...theme, fields })}
        />
      ) : null}
      {tab === "effects" ? (
        <FormThemeEffectsSection
          effects={theme.effects}
          onChange={(effects) => onThemeChange({ ...theme, effects })}
        />
      ) : null}
      {tab === "images" ? (
        <ImagesSection
          headerImage={props.headerImage}
          logoImage={props.logoImage}
          backgroundImage={props.backgroundImage}
          onUploadHeader={props.onUploadHeader}
          onUploadLogo={props.onUploadLogo}
          onUploadBackground={props.onUploadBackground}
          onClearHeader={props.onClearHeader}
          onClearLogo={props.onClearLogo}
          onClearBackground={props.onClearBackground}
        />
      ) : null}
      {tab === "content" ? (
        <FormThemeContentFields
          welcomeMessage={props.welcomeMessage}
          submitButtonText={props.submitButtonText}
          successMessage={props.successMessage}
          successPageHtml={props.successPageHtml}
          successRedirectUrl={props.successRedirectUrl}
          successRedirectDelay={props.successRedirectDelay}
          onWelcomeChange={props.onWelcomeChange}
          onSubmitLabelChange={props.onSubmitLabelChange}
          onSuccessChange={props.onSuccessChange}
          onSuccessPageHtmlChange={props.onSuccessPageHtmlChange}
          onSuccessRedirectUrlChange={props.onSuccessRedirectUrlChange}
          onSuccessRedirectDelayChange={props.onSuccessRedirectDelayChange}
        />
      ) : null}
      {tab === "experience" ? (
        <ThemeExperienceSection theme={theme} onChange={onThemeChange} />
      ) : null}
      {tab === "advanced" ? (
        <div className="space-y-6">
          <TemplateSelector onApply={(next) => onThemeChange(next)} />
          <ThemeAppearanceControls theme={theme} onChange={onThemeChange} />
        </div>
      ) : null}
    </div>
  );
}
