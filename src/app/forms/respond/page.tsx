"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, FileEdit } from "lucide-react";
import { ThemeToggle } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RespondFormLandingPage() {
  const [formId, setFormId] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = formId.trim();
    if (id) router.push(`/forms/${id}/respond`);
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="flex items-center justify-between gap-4 border-b border-neutral-200 bg-[var(--background)] px-4 py-3 sm:px-6 dark:border-neutral-700">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-small font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Voltar ao início
        </Link>
        <ThemeToggle />
      </header>

      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-10 md:px-8">
        <div className="mx-auto max-w-md">
          <div className="mb-lg flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
              <FileEdit className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h1 className="text-h2 font-semibold text-[var(--text-primary)] sm:text-h1">
                Responder formulário
              </h1>
              <p className="mt-0.5 text-body text-[var(--text-secondary)]">
                Cole o ID do formulário ou o link que você recebeu.
              </p>
            </div>
          </div>

          <Card padding="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                label="ID ou link do formulário"
                placeholder="Ex.: 550e8400-e29b-41d4-a716-446655440000"
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                className="w-full"
              />
              <Button type="submit" variant="primary" className="w-full" disabled={!formId.trim()}>
                Ir para o formulário
              </Button>
            </form>
          </Card>

          <p className="mt-6 text-center text-small text-[var(--text-secondary)]">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-primary-600 hover:underline dark:text-primary-400"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Voltar ao início
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
