"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useForm } from "@/hooks/useForm";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeEditor } from "@/components/forms/theme-editor/theme-editor";
import { FormPreview } from "@/components/forms/theme-editor/form-preview";
import { ResponsivePreview } from "@/components/forms/responsive-preview";
import { ThemeAccessibilityBadge } from "@/components/forms/theme-editor/theme-accessibility-badge";
import { ThemeEditorTour } from "@/components/forms/theme-editor/theme-editor-tour";
import type { FormTheme } from "@/types/form-theme";
import { DEFAULT_FORM_THEME } from "@/types/form-theme-defaults";
import { compressImageFile } from "@/lib/compress-image-file";
import { exportElementToPngFile } from "@/lib/export-form-preview-png";
import * as api from "@/lib/api";
import type { RespondFormQuestion } from "@/components/forms/respond-form-view";

export default function FormThemePage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const toast = useToast();
  const { data, loading, error, refetch } = useForm(id);
  const [theme, setTheme] = useState<FormTheme>(DEFAULT_FORM_THEME);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [submitButtonText, setSubmitButtonText] = useState("Enviar");
  const [successMessage, setSuccessMessage] = useState("");
  const [successPageHtml, setSuccessPageHtml] = useState("");
  const [successRedirectUrl, setSuccessRedirectUrl] = useState("");
  const [successRedirectDelay, setSuccessRedirectDelay] = useState(0);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewForceDark, setPreviewForceDark] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const previewCaptureRef = useRef<HTMLDivElement>(null);
  const previewTheme = useDebouncedValue(theme, 300);

  useEffect(() => {
    if (!data?.theme) return;
    setTheme(data.theme);
    setWelcomeMessage(data.welcomeMessage ?? "");
    setSubmitButtonText(data.submitButtonText ?? "Enviar");
    setSuccessMessage(data.successMessage ?? "");
    setSuccessPageHtml(data.successPageHtml ?? "");
    setSuccessRedirectUrl(data.successRedirectUrl ?? "");
    setSuccessRedirectDelay(
      typeof data.successRedirectDelay === "number" && !Number.isNaN(data.successRedirectDelay)
        ? data.successRedirectDelay
        : 0
    );
    setHeaderImage(data.headerImage ?? null);
    setLogoImage(data.logoImage ?? null);
    setBackgroundImage(data.backgroundImage ?? null);
  }, [data]);

  const handleSave = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    try {
      await api.patchFormTheme(
        id,
        {
          theme,
          headerImage,
          logoImage,
          backgroundImage,
          welcomeMessage: welcomeMessage.trim() || null,
          submitButtonText: submitButtonText.trim() || "Enviar",
          successMessage: successMessage.trim() || null,
          successPageHtml: successPageHtml.trim() || null,
          successRedirectUrl: successRedirectUrl.trim() || null,
          successRedirectDelay:
            successRedirectUrl.trim() === ""
              ? null
              : Math.min(600, Math.max(0, Math.floor(successRedirectDelay))),
        },
        userId
      );
      toast("Tema guardado.", "success");
      await refetch();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao guardar", "error");
    } finally {
      setSaving(false);
    }
  }, [
    id,
    theme,
    headerImage,
    logoImage,
    backgroundImage,
    welcomeMessage,
    submitButtonText,
    successMessage,
    successPageHtml,
    successRedirectUrl,
    successRedirectDelay,
    userId,
    toast,
    refetch,
  ]);

  const upload = useCallback(
    async (file: File, kind: "header" | "logo" | "bg") => {
      const ready = await compressImageFile(file);
      const url = await api.uploadAdminFormImage(ready, { scope: "branding" });
      if (kind === "header") setHeaderImage(url);
      if (kind === "logo") setLogoImage(url);
      if (kind === "bg") setBackgroundImage(url);
    },
    []
  );

  const handleExportPreviewPng = useCallback(() => {
    const el = previewCaptureRef.current;
    if (!el || !id) {
      toast("Pré-visualização indisponível.", "error");
      return;
    }
    void exportElementToPngFile(el, `form-${id.slice(0, 8)}-preview.png`)
      .then(() => {
        toast("Imagem exportada.", "success");
      })
      .catch(() => {
        toast("Não foi possível exportar a imagem.", "error");
      });
  }, [id, toast]);

  const handleExportTheme = useCallback(async () => {
    if (!id) return;
    try {
      const blob = await api.exportFormThemeJson(id, userId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `form-theme-${id.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Tema exportado.", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao exportar", "error");
    }
  }, [id, userId, toast]);

  const handleImportFile = useCallback(
    async (file: File | null) => {
      if (!file || !id) return;
      setSaving(true);
      try {
        const text = await file.text();
        const parsed = JSON.parse(text) as { theme?: unknown };
        if (parsed.theme === undefined) {
          throw new Error("JSON inválido: falta a propriedade theme");
        }
        const updated = await api.importFormThemeJson(id, { theme: parsed.theme }, userId);
        setTheme(updated.theme);
        setWelcomeMessage(updated.welcomeMessage ?? "");
        setSubmitButtonText(updated.submitButtonText ?? "Enviar");
        setSuccessMessage(updated.successMessage ?? "");
        setSuccessPageHtml(updated.successPageHtml ?? "");
        setSuccessRedirectUrl(updated.successRedirectUrl ?? "");
        setSuccessRedirectDelay(
          typeof updated.successRedirectDelay === "number" && !Number.isNaN(updated.successRedirectDelay)
            ? updated.successRedirectDelay
            : 0
        );
        setHeaderImage(updated.headerImage ?? null);
        setLogoImage(updated.logoImage ?? null);
        setBackgroundImage(updated.backgroundImage ?? null);
        toast("Tema importado.", "success");
        await refetch();
      } catch (e) {
        toast(e instanceof Error ? e.message : "Erro ao importar", "error");
      } finally {
        setSaving(false);
        if (importInputRef.current) importInputRef.current.value = "";
      }
    },
    [id, userId, toast, refetch]
  );

  if (loading) {
    return (
      <div className="p-lg">
        <p className="text-body text-[var(--text-secondary)]">Carregando...</p>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="p-lg">
        <p className="text-body text-[var(--text-primary)]">{error ?? "Formulário não encontrado."}</p>
        <Link href="/admin/forms" className="mt-4 inline-block">
          <Button variant="secondary">Voltar</Button>
        </Link>
      </div>
    );
  }

  const previewQuestions = (data.questions ?? []).slice(0, 4) as RespondFormQuestion[];

  return (
    <div className="p-lg">
      <nav className="mb-md flex items-center gap-2 text-small text-[var(--text-secondary)]">
        <Link href="/admin/forms" className="hover:text-primary-600 dark:hover:text-primary-400">
          Formulários
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/admin/forms/${id}/edit`} className="hover:text-primary-600 dark:hover:text-primary-400">
          Editar
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--text-primary)]">Tema</span>
      </nav>
      <div className="mb-lg flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h2 text-[var(--text-primary)]">Tema e aparência</h1>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => void handleExportTheme()}>
            Exportar JSON
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => importInputRef.current?.click()}
          >
            Importar JSON
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => void handleImportFile(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => setTheme(DEFAULT_FORM_THEME)}
          >
            Repor tema padrão
          </Button>
          <Button type="button" variant="primary" loading={saving} onClick={() => void handleSave()}>
            Guardar tema
          </Button>
        </div>
      </div>
      <div className="grid gap-lg lg:grid-cols-2">
        <Card padding="lg">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Editor</CardTitle>
              <ThemeAccessibilityBadge theme={theme} />
            </div>
          </CardHeader>
          <CardContent>
            <ThemeEditor
              theme={theme}
              onThemeChange={setTheme}
              welcomeMessage={welcomeMessage}
              submitButtonText={submitButtonText}
              successMessage={successMessage}
              successPageHtml={successPageHtml}
              successRedirectUrl={successRedirectUrl}
              successRedirectDelay={successRedirectDelay}
              onWelcomeChange={setWelcomeMessage}
              onSubmitLabelChange={setSubmitButtonText}
              onSuccessChange={setSuccessMessage}
              onSuccessPageHtmlChange={setSuccessPageHtml}
              onSuccessRedirectUrlChange={setSuccessRedirectUrl}
              onSuccessRedirectDelayChange={setSuccessRedirectDelay}
              headerImage={headerImage}
              logoImage={logoImage}
              backgroundImage={backgroundImage}
              onUploadHeader={(f) => upload(f, "header")}
              onUploadLogo={(f) => upload(f, "logo")}
              onUploadBackground={(f) => upload(f, "bg")}
              onClearHeader={() => setHeaderImage(null)}
              onClearLogo={() => setLogoImage(null)}
              onClearBackground={() => setBackgroundImage(null)}
            />
          </CardContent>
        </Card>
        <Card padding="lg">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Pré-visualização</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="secondary" onClick={handleExportPreviewPng}>
                  Exportar imagem
                </Button>
                <label className="flex cursor-pointer items-center gap-2 text-small text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={previewForceDark}
                    onChange={(e) => setPreviewForceDark(e.target.checked)}
                  />
                  Simular fundo escuro
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsivePreview
              responsive={previewTheme.responsive ?? DEFAULT_FORM_THEME.responsive}
              captureRootRef={previewCaptureRef}
            >
              <FormPreview
                formId={id}
                title={data.title}
                description={data.description}
                questions={previewQuestions}
                theme={previewTheme}
                headerImage={headerImage ?? undefined}
                logoImage={logoImage ?? undefined}
                backgroundImage={backgroundImage ?? undefined}
                welcomeMessage={welcomeMessage}
                submitButtonText={submitButtonText}
                successMessage={successMessage}
                successPageHtml={successPageHtml}
                successRedirectUrl={successRedirectUrl}
                successRedirectDelay={successRedirectDelay}
                previewForceDark={previewForceDark}
              />
            </ResponsivePreview>
          </CardContent>
        </Card>
      </div>
      <p className="mt-lg">
        <Link
          href={`/admin/forms/${id}/edit`}
          className="inline-flex items-center gap-1 text-small text-primary-600 hover:underline dark:text-primary-400"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Voltar à edição do formulário
        </Link>
      </p>
      <ThemeEditorTour onDismiss={() => undefined} />
    </div>
  );
}
