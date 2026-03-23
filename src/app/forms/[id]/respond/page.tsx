"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ThemeToggle } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "@/hooks/useForm";
import { RespondFormView, type RespondFormQuestion } from "@/components/forms/respond-form-view";

export default function RespondFormPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: form, loading, error } = useForm(id);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-[var(--background)]">
        <header className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3 sm:px-6 dark:border-neutral-700">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-small text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Voltar
          </Link>
          <ThemeToggle />
        </header>
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
          <p className="text-body text-[var(--text-secondary)]">Carregando...</p>
        </div>
      </main>
    );
  }
  if (error || !form) {
    return (
      <main className="flex min-h-screen flex-col bg-[var(--background)]">
        <header className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3 sm:px-6 dark:border-neutral-700">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-small text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Voltar
          </Link>
          <ThemeToggle />
        </header>
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center p-4 sm:p-6">
          <Card className="w-full text-center" padding="lg">
            <p className="text-body text-[var(--text-secondary)]" role="alert">
              {error ?? "Formulário não encontrado."}
            </p>
            <Link href="/" className="mt-6 inline-block">
              <Button variant="primary">Voltar ao início</Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  if (form.status !== "active") {
    return (
      <main className="flex min-h-screen flex-col bg-[var(--background)]">
        <header className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3 sm:px-6 dark:border-neutral-700">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-small text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Voltar
          </Link>
          <ThemeToggle />
        </header>
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center p-4 sm:p-6">
          <Card className="w-full text-center" padding="lg">
            <p className="text-body text-[var(--text-secondary)]">
              Este formulário não está disponível para respostas no momento.
            </p>
            <Link href="/" className="mt-6 inline-block">
              <Button variant="primary">Voltar ao início</Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  const questions = (form.questions ?? []) as RespondFormQuestion[];

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-neutral-200 bg-[var(--background)]/95 px-4 py-3 backdrop-blur sm:px-6 dark:border-neutral-700">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-small font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Voltar ao início
        </Link>
        <ThemeToggle />
      </header>
      <div className="mx-auto max-w-content px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        <RespondFormView
          formId={form.id}
          form={{
            title: form.title,
            description: form.description,
            closingMessage: form.closingMessage,
            allowAnonymous: form.allowAnonymous,
            questions,
          }}
        />
      </div>
    </main>
  );
}
