"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/api";
import { useToast } from "@/contexts/toast-context";

export function SuggestFormCopyButton({
  kind,
  userId,
  context,
  onApply,
  disabled,
  label = "Sugerir com IA",
}: Readonly<{
  kind: api.SuggestFormCopyKind;
  userId?: string;
  context: {
    title?: string;
    description?: string;
    shareLink?: string | null;
    shortLink?: string | null;
  };
  onApply: (text: string) => void;
  disabled?: boolean;
  label?: string;
}>) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading || disabled) return;
    setLoading(true);
    try {
      const { text } = await api.suggestFormCopy(
        {
          kind,
          title: context.title?.trim() || undefined,
          description: context.description?.trim() || undefined,
          shareLink: context.shareLink?.trim() || undefined,
          shortLink: context.shortLink?.trim() || undefined,
        },
        userId
      );
      onApply(text);
      toast("Texto sugerido aplicado. Revise antes de salvar.", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao sugerir texto", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => void handleClick()}
      loading={loading}
      disabled={disabled || loading}
      leftIcon={<Sparkles className="h-3.5 w-3.5" />}
      className="shrink-0 text-primary-600 dark:text-primary-400"
    >
      {label}
    </Button>
  );
}
