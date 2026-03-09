"use client";

import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  LogIn,
  ClipboardList,
  LayoutDashboard,
  MessageSquare,
  Send,
  User,
  MessageCircle,
  ExternalLink,
  Copy,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const LINK_TUTORIAL = {
  linkedin: "https://www.linkedin.com/in/nickolas-madeiro/",
  instagram: "https://www.instagram.com/nickolas_madeiro/?hl=ar",
  portfolio: "https://nickolas-madeiro-portfolio.vercel.app/",
};

function Section({
  id,
  title,
  icon: Icon,
  children,
}: Readonly<{
  id: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}>) {
  return (
    <section id={id} className="scroll-mt-20">
      <Card className="mb-lg" padding="none">
        <CardHeader className="flex flex-row items-center gap-3 p-xl pb-lg">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400 sm:h-12 sm:w-12">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
          </span>
          <CardTitle className="mb-0 border-0 pb-0 text-h3 sm:text-h2">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-xl pt-0">{children}</CardContent>
      </Card>
    </section>
  );
}

function Step({ number, title, children }: Readonly<{ number: number; title: string; children: React.ReactNode }>) {
  return (
    <div className="mb-lg last:mb-0">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600 text-small font-semibold text-white sm:h-8 sm:w-8">
          {number}
        </span>
        <h4 className="text-h4 text-[var(--text-primary)]">{title}</h4>
      </div>
      <div className="ml-0 text-body text-[var(--text-secondary)] sm:ml-10">{children}</div>
    </div>
  );
}

export default function TutorialPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-neutral-200 bg-[var(--background)]/95 px-4 py-3 backdrop-blur sm:px-6 dark:border-neutral-700">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-small font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Voltar ao início</span>
        </Link>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden />
          <h1 className="text-h4 font-semibold text-[var(--text-primary)] sm:text-h3">Tutorial Consultech</h1>
        </div>
        <ThemeToggle />
      </header>

      <div className="mx-auto max-w-content px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        <nav aria-label="Navegação do tutorial" className="mb-xl">
          <Card padding="md">
            <h2 className="mb-lg text-h4 text-[var(--text-primary)]">Navegação rápida</h2>
            <ul className="flex flex-wrap gap-2 text-small">
              {[
                { id: "concepcao", label: "Concepção" },
                { id: "login", label: "Login" },
                { id: "formularios", label: "Formulários" },
                { id: "respostas", label: "Respostas" },
                { id: "dashboards", label: "Dashboards" },
                { id: "responder", label: "Responder" },
                { id: "sugestoes", label: "Sugestões" },
                { id: "desenvolvimento", label: "Desenvolvimento" },
                { id: "historico", label: "Histórico" },
              ].map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="inline-flex items-center rounded-lg bg-neutral-100 px-3 py-1.5 text-[var(--text-primary)] transition-colors hover:bg-primary-100 hover:text-primary-700 dark:bg-neutral-800 dark:hover:bg-primary-900/30 dark:hover:text-primary-400"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        </nav>

        <Section id="concepcao" title="Concepção do projeto" icon={BookOpen}>
          <p className="mb-lg text-body text-[var(--text-secondary)]">
            O <strong className="text-[var(--text-primary)]">Consultech</strong> é um sistema de gestão de
            formulários internos focado em clareza, dados e experiência moderna. O objetivo é permitir que
            administradores criem formulários, publiquem links para coleta de respostas e acompanhem métricas
            em dashboards unificados.
          </p>
          <p className="mb-lg text-body text-[var(--text-secondary)]">
            O sistema segue um design system próprio (tipografia, cores, espaçamento, dark mode) para
            consistência visual e responsividade <strong className="text-[var(--text-primary)]">mobile first</strong>:
            todas as telas foram pensadas primeiro para celular e depois adaptadas para tablet e desktop.
          </p>
          <p className="text-body text-[var(--text-secondary)]">
            Principais pilares: <strong className="text-[var(--text-primary)]">formulários</strong> (criar, editar,
            status, links), <strong className="text-[var(--text-primary)]">respostas</strong> (visualizar e
            exportar) e <strong className="text-[var(--text-primary)]">dashboards</strong> (agregar métricas de
            vários formulários em um só lugar).
          </p>
        </Section>

        <Section id="login" title="Login (área admin)" icon={LogIn}>
          <p className="mb-lg text-body text-[var(--text-secondary)]">
            Apenas usuários administradores podem acessar o painel. O login é feito com e-mail e senha
            cadastrados no sistema.
          </p>
          <Step number={1} title="Acessar a tela de login">
            Na página inicial, clique em <strong>Painel Admin</strong> ou acesse diretamente a rota de
            login. Se você já estiver deslogado e tentar abrir qualquer página do admin, será redirecionado
            para o login.
          </Step>
          <Step number={2} title="Inserir e-mail e senha">
            Preencha os campos <strong>E-mail</strong> e <strong>Senha</strong> com suas credenciais de
            administrador. Ambos são obrigatórios.
          </Step>
          <Step number={3} title="Entrar">
            Clique em <strong>Entrar</strong>. Se as credenciais estiverem corretas, você verá uma mensagem
            de sucesso (toast) e será redirecionado automaticamente para a tela de <strong>Formulários</strong>.
              Em caso de erro, uma mensagem será exibida na tela e em um toast.
          </Step>
          <p className="mt-lg text-small text-[var(--text-secondary)]">
            Na tela de login há ainda o link <strong>Voltar ao início</strong> e o alternador de tema (claro/escuro).
          </p>
        </Section>

        <Section id="formularios" title="Formulários" icon={ClipboardList}>
          <p className="mb-lg text-body text-[var(--text-secondary)]">
            Na lista de formulários você vê todos os seus formulários, filtra por status, ordena por data ou
            título e acessa ações rápidas: editar, ver respostas, copiar link completo ou link curto (se houver
            slug), duplicar e arquivar.
          </p>
          <h4 className="mb-2 text-h4 text-[var(--text-primary)]">Criar novo formulário</h4>
          <ul className="mb-lg list-inside list-disc space-y-1 text-body text-[var(--text-secondary)]">
            <li>Clique em <strong>Novo formulário</strong> no canto superior direito.</li>
            <li>Passo 1 — Informações: preencha título, descrição (opcional), slug (opcional, para link curto) e se permite resposta anônima.</li>
            <li>Passo 2 — Perguntas: adicione perguntas, escolha o tipo (texto curto/longo, múltipla escolha, checkbox, escala, sim/não, data, número), marque se é obrigatória e, para múltipla escolha/checkbox, defina as opções.</li>
            <li>Passo 3 — Revisar: confira os dados e clique em <strong>Criar formulário</strong>. Você será redirecionado para a edição do formulário criado.</li>
          </ul>
          <h4 className="mb-2 text-h4 text-[var(--text-primary)]">Editar formulário</h4>
          <ul className="mb-lg list-inside list-disc space-y-1 text-body text-[var(--text-secondary)]">
            <li>Na lista, clique em <strong>Editar</strong> no card do formulário.</li>
            <li>Altere título, descrição, slug, status (Rascunho, Ativo, Pausado, Arquivado) e as perguntas.</li>
            <li>Use <strong>Salvar</strong> para manter na edição ou <strong>Salvar e voltar à lista</strong> para retornar à lista de formulários.</li>
          </ul>
          <h4 className="mb-2 text-h4 text-[var(--text-primary)]">Status do formulário</h4>
          <ul className="mb-lg list-inside list-disc space-y-1 text-body text-[var(--text-secondary)]">
            <li><strong>Rascunho:</strong> só você vê; não aceita respostas.</li>
            <li><strong>Ativo:</strong> aceita respostas; link visível para respondentes.</li>
            <li><strong>Pausado:</strong> não aceita respostas; pode reativar depois.</li>
            <li><strong>Arquivado:</strong> só leitura; não aceita respostas nem edição de conteúdo.</li>
          </ul>
          <h4 className="mb-2 text-h4 text-[var(--text-primary)]">Links para resposta</h4>
          <ul className="mb-lg list-inside list-disc space-y-1 text-body text-[var(--text-secondary)]">
            <li><strong>Link completo:</strong> use o botão de copiar link completo no card do formulário. O link tem o formato <code className="rounded bg-neutral-200 px-1 font-mono text-caption dark:bg-neutral-700">/forms/[id]/respond</code>.</li>
            <li><strong>Link curto:</strong> se o formulário tiver slug configurado, aparecerá o botão para copiar link curto no formato <code className="rounded bg-neutral-200 px-1 font-mono text-caption dark:bg-neutral-700">/r/[slug]</code>.</li>
          </ul>
          <h4 className="mb-2 text-h4 text-[var(--text-primary)]">Duplicar e arquivar</h4>
          <ul className="list-inside list-disc space-y-1 text-body text-[var(--text-secondary)]">
            <li>Clique nos três pontinhos (<strong>⋮</strong>) no card do formulário e escolha <strong>Duplicar</strong> para criar uma cópia em rascunho, ou <strong>Arquivar</strong> para mudar o status para arquivado (reversível na edição).</li>
          </ul>
        </Section>

        <Section id="respostas" title="Respostas do formulário" icon={MessageSquare}>
          <p className="mb-lg text-body text-[var(--text-secondary)]">
            Para ver as respostas enviadas por quem preencheu o formulário, use o botão <strong>Ver respostas</strong> na lista de formulários.
          </p>
          <Step number={1} title="Abrir a lista de respostas">
            Na lista de formulários, clique em <strong>Ver respostas</strong> no card do formulário desejado.
          </Step>
          <Step number={2} title="Visualizar e exportar">
            Na tela de respostas você vê cada envio com dados do respondente (nome, e-mail) e data. Para
            exportar, use os botões <strong>CSV</strong>, <strong>Excel</strong> ou <strong>JSON</strong>. O
            download será iniciado e uma mensagem de confirmação aparecerá (toast). Em caso de erro ao carregar, use <strong>Tentar novamente</strong>.
          </Step>
        </Section>

        <Section id="dashboards" title="Dashboards" icon={LayoutDashboard}>
          <p className="mb-lg text-body text-[var(--text-secondary)]">
            Dashboards permitem reunir métricas de vários formulários em um único lugar: total de formulários vinculados e total de respostas (com filtro por período).
          </p>
          <Step number={1} title="Criar um dashboard">
            Na lista de dashboards, preencha o campo <strong>Título</strong> e marque os formulários que deseja vincular. Clique em <strong>Criar dashboard</strong>. Após a criação, você será redirecionado para a página do novo dashboard.
          </Step>
          <Step number={2} title="Ver resumo e formulários vinculados">
            Na página do dashboard você vê dois cards de resumo (número de formulários e total de respostas) e a lista de formulários vinculados com quantidade de respostas e link para <strong>Ver respostas</strong>. Use o filtro <strong>Período</strong> (Todo o período, Últimos 7 dias, Últimos 30 dias) para refinar os totais.
          </Step>
          <Step number={3} title="Editar ou excluir">
            Use <strong>Editar</strong> para alterar o título e os formulários vinculados. Use o ícone de lixeira para excluir o dashboard (confirmação no modal). Todas as ações exibem feedback em toast.
          </Step>
        </Section>

        <Section id="responder" title="Responder a um formulário" icon={Send}>
          <p className="mb-lg text-body text-[var(--text-secondary)]">
            Qualquer pessoa com o link pode responder a um formulário, desde que ele esteja com status <strong>Ativo</strong>.
          </p>
          <Step number={1} title="Obter o link">
            O administrador compartilha o link completo (<code className="rounded bg-neutral-200 px-1 font-mono text-caption dark:bg-neutral-700">/forms/[id]/respond</code>) ou o link curto (<code className="rounded bg-neutral-200 px-1 font-mono text-caption dark:bg-neutral-700">/r/[slug]</code>), copiando-o na lista de formulários.
          </Step>
          <Step number={2} title="Preencher e enviar">
            Abra o link no navegador, preencha as perguntas e envie o formulário. Em formulários que exigem identificação, informe nome e e-mail. Ao enviar, uma confirmação é exibida.
          </Step>
        </Section>

        <Section id="sugestoes" title="Sugestões e melhorias" icon={MessageCircle}>
          <p className="text-body text-[var(--text-secondary)]">
            Se você tiver <strong>sugestões de melhorias</strong> ou quiser reportar algo sobre o sistema, informe à{" "}
            <strong className="text-[var(--text-primary)]">Vice-presidente Maria Vitória Santos</strong>. Ela é o canal oficial para reunir feedback e encaminhar demandas relacionadas ao Consultech.
          </p>
        </Section>

        <Section id="desenvolvimento" title="Desenvolvimento do sistema" icon={User}>
          <p className="mb-lg text-body text-[var(--text-secondary)]">
            O sistema Consultech é <strong>implementado, sustentado e desenvolvido</strong> por{" "}
            <strong className="text-[var(--text-primary)]">Nickolas Madeiro</strong>.
          </p>
          <ul className="flex flex-wrap gap-3 text-body">
            <li>
              <a
                href={LINK_TUTORIAL.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-[var(--surface)] px-4 py-2 text-primary-600 transition-colors hover:bg-primary-50 hover:border-primary-200 dark:border-neutral-600 dark:hover:bg-primary-900/20 dark:hover:border-primary-800"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href={LINK_TUTORIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-[var(--surface)] px-4 py-2 text-primary-600 transition-colors hover:bg-primary-50 hover:border-primary-200 dark:border-neutral-600 dark:hover:bg-primary-900/20 dark:hover:border-primary-800"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Instagram
              </a>
            </li>
            <li>
              <a
                href={LINK_TUTORIAL.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-[var(--surface)] px-4 py-2 text-primary-600 transition-colors hover:bg-primary-50 hover:border-primary-200 dark:border-neutral-600 dark:hover:bg-primary-900/20 dark:hover:border-primary-800"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Portfólio
              </a>
            </li>
          </ul>
        </Section>

        <Section id="historico" title="Histórico de alterações" icon={Copy}>
          <p className="mb-lg text-body text-[var(--text-secondary)]">
            Esta seção é atualizada sempre que houver mudanças ou novas funcionalidades no sistema. Ao adicionar ou alterar algo no Consultech, documente aqui a data e uma descrição objetiva da mudança.
          </p>
          <Card padding="md" className="border-dashed border-neutral-300 dark:border-neutral-600">
            <p className="mb-2 text-caption text-[var(--text-secondary)]">
              Novas alterações: adicione no topo da lista (data e descrição).
            </p>
            <ul className="space-y-2 text-small text-[var(--text-secondary)]">
              <li className="flex flex-wrap gap-2">
                <span className="font-mono text-caption text-[var(--text-secondary)]">[Data]</span>
                <span>Publicação do tutorial inicial: concepção, login, formulários, respostas, dashboards, responder, créditos e histórico.</span>
              </li>
            </ul>
          </Card>
        </Section>

        <footer className="mt-xl border-t border-neutral-200 pt-lg text-center text-small text-[var(--text-secondary)] dark:border-neutral-700">
          <p>Consultech — Gestão de Formulários Internos</p>
          <p className="mt-1">
            <Link href="/" className="text-primary-600 hover:underline dark:text-primary-400">
              Voltar ao início
            </Link>
            {" · "}
            <Link href="/login" className="text-primary-600 hover:underline dark:text-primary-400">
              Login admin
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
