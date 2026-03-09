"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, ClipboardList, FileEdit, DollarSign, BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

type DevModalType = "financeiro" | null;

export default function Home() {
  const [devModal, setDevModal] = useState<DevModalType>(null);

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Header com tema */}
      <header className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </header>

      {/* Modal "Em desenvolvimento" — só monta quando aberto */}
      {devModal !== null && (
        <Modal
          open={true}
          onClose={() => setDevModal(null)}
          title="Financeiro"
          footer={
            <Button variant="primary" size="md" onClick={() => setDevModal(null)}>
              Fechar
            </Button>
          }
        >
          <p className="text-body text-[var(--text-secondary)]">
            Esta funcionalidade ainda está em desenvolvimento. Em breve você poderá utilizá-la.
          </p>
        </Modal>
      )}
      {/* Conteúdo central — mobile first */}
      <div className="mx-auto flex min-h-screen max-w-content flex-col justify-center px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
        <div className="w-full space-y-8 sm:space-y-10">
          {/* Hero */}
          <div className="text-center">
            <h1 className="text-h2 font-semibold tracking-tight text-[var(--text-primary)] sm:text-h1">
              Consultech
            </h1>
            <p className="mt-1 text-body-lg text-[var(--text-secondary)] sm:mt-2">
              Gestão de Formulários Internos
            </p>
            <p className="mt-2 text-body text-[var(--text-secondary)] sm:mt-3">
              Sistema para criar, publicar e analisar formulários com painel admin e link público para resposta.
            </p>
          </div>

          {/* Cards de ação — 1 col mobile, 2 tablet, 3+ desktop */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 sm:gap-6">
            <Link href="/admin/forms" className="block transition-transform duration-150 ease-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[var(--background)] rounded-xl">
              <Card
                padding="lg"
                className="h-full border-neutral-200 bg-[var(--surface)] dark:border-neutral-700"
              >
                <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400 sm:h-14 sm:w-14">
                    <ClipboardList className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
                  </span>
                  <div className="min-h-[3.25rem] w-full min-w-0">
                    <h2 className="truncate text-h4 text-[var(--text-primary)]" title="Painel Admin">Painel Admin</h2>
                    <p className="mt-0.5 truncate text-small text-[var(--text-secondary)]" title="Criar e gerenciar formulários">
                      Criar e gerenciar formulários
                    </p>
                  </div>
                  <span className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-600 px-4 text-body font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-700 dark:focus-visible:ring-offset-neutral-900">
                    Acessar
                  </span>
                </div>
              </Card>
            </Link>

            <Link href="/admin/dashboards" className="block transition-transform duration-150 ease-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[var(--background)] rounded-xl">
              <Card
                padding="lg"
                className="h-full border-neutral-200 bg-[var(--surface)] dark:border-neutral-700"
              >
                <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400 sm:h-14 sm:w-14">
                    <LayoutDashboard className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
                  </span>
                  <div className="min-h-[3.25rem] w-full min-w-0">
                    <h2 className="truncate text-h4 text-[var(--text-primary)]" title="Dashboards">Dashboards</h2>
                    <p className="mt-0.5 truncate text-small text-[var(--text-secondary)]" title="Visualizar métricas e respostas">
                      Visualizar métricas e respostas
                    </p>
                  </div>
                  <span className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-600 px-4 text-body font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-700 dark:focus-visible:ring-offset-neutral-900">
                    Acessar
                  </span>
                </div>
              </Card>
            </Link>

            <Link href="/forms/respond" className="block transition-transform duration-150 ease-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[var(--background)] rounded-xl">
              <Card
                padding="lg"
                className="h-full border-neutral-200 bg-[var(--surface)] dark:border-neutral-700"
              >
                <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 sm:h-14 sm:w-14">
                    <FileEdit className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
                  </span>
                  <div className="min-h-[3.25rem] w-full min-w-0">
                    <h2 className="truncate text-h4 text-[var(--text-primary)]" title="Responder formulário">Responder formulário</h2>
                    <p className="mt-0.5 truncate text-small text-[var(--text-secondary)]" title="Acessar por link público">
                      Acessar por link público
                    </p>
                  </div>
                  <span className="inline-flex h-10 items-center justify-center rounded-lg bg-neutral-100 px-4 text-body font-medium text-neutral-900 transition-colors duration-150 ease-out hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700">
                    Acessar
                  </span>
                </div>
              </Card>
            </Link>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setDevModal("financeiro");
              }}
              className="block w-full text-left transition-transform duration-150 ease-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[var(--background)] rounded-xl"
            >
              <Card
                padding="lg"
                className="h-full border-neutral-200 bg-[var(--surface)] dark:border-neutral-700"
              >
                <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400 sm:h-14 sm:w-14">
                    <DollarSign className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
                  </span>
                  <div className="min-h-[3.25rem] w-full min-w-0">
                    <h2 className="truncate text-h4 text-[var(--text-primary)]" title="Financeiro">Financeiro</h2>
                    <p className="mt-0.5 truncate text-small text-[var(--text-secondary)]" title="Módulo financeiro">
                      Módulo financeiro
                    </p>
                  </div>
                  <span className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-600 px-4 text-body font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-700 dark:focus-visible:ring-offset-neutral-900">
                    Acessar
                  </span>
                </div>
              </Card>
            </button>

            <Link
              href="/tutorial"
              className="block transition-transform duration-150 ease-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[var(--background)] rounded-xl"
              aria-label="Abrir tutorial do sistema"
            >
              <Card
                padding="lg"
                className="h-full border-neutral-200 bg-[var(--surface)] dark:border-neutral-700"
              >
                <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400 sm:h-14 sm:w-14">
                    <BookOpen className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
                  </span>
                  <div className="min-h-[3.25rem] w-full min-w-0">
                    <h2 className="truncate text-h4 text-[var(--text-primary)]" title="Tutorial">Tutorial</h2>
                    <p className="mt-0.5 truncate text-small text-[var(--text-secondary)]" title="Funcionalidades do sistema">
                      Funcionalidades do sistema
                    </p>
                  </div>
                  <span className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-600 px-4 text-body font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-700 dark:focus-visible:ring-offset-neutral-900">
                    Acessar
                  </span>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
