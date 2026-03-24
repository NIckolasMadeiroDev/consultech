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
                { id: "financeiro", label: "Financeiro" },
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
            <li>Passo 2 — Perguntas: tipos incluem texto curto/longo, múltipla escolha, lista suspensa (dropdown), checkbox, escala, sim/não, data, número e seções; para opções, use as setas para reordenar. Pasta e “modelo” ajudam a organizar e reutilizar pesquisas periódicas.</li>
            <li>
              Publicar: na lista, <strong>Tirar do rascunho e publicar</strong> leva à edição no cartão certo; em
              Editar, use <strong>Tirar do rascunho e publicar agora</strong> ou status <strong>Ativo</strong> +
              Salvar — só assim o link aceita respostas.
            </li>
            <li>Passo 3 — Revisar: confira os dados; use <strong>Criar formulário</strong> (com ou sem &quot;Já publicar como Ativo&quot;) ou <strong>Criar e publicar</strong>. Depois você cai na edição do formulário.</li>
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

        <Section id="financeiro" title="Módulo Financeiro" icon={LayoutDashboard}>
          <p className="mb-lg text-body text-[var(--text-secondary)]">
            O módulo financeiro traz uma visão completa de <strong className="text-[var(--text-primary)]">caixas, movimentações, contas a pagar/receber, relatórios e auditoria</strong>,
            além de um chat de <strong className="text-[var(--text-primary)]">IA Financeira</strong> para tirar dúvidas sobre os dados.
          </p>

          <Step number={1} title="Entrar como admin ou visitante">
            <p className="mb-2">
              Ao acessar qualquer rota em <code className="rounded bg-neutral-200 px-1 font-mono text-caption dark:bg-neutral-700">/finance</code>, é exibido um painel perguntando como você quer acessar:
            </p>
            <ul className="mb-2 list-inside list-disc space-y-1">
              <li>
                <strong>Admin:</strong> acesso completo para <strong>cadastrar, editar, excluir, quitar e receber</strong> no financeiro.
              </li>
              <li>
                <strong>Visitante:</strong> acesso somente leitura, funcionando como um <strong>portal de transparência</strong> — você vê tudo,
                mas <strong>não consegue alterar nada</strong> (todos os botões de ação somem).
              </li>
            </ul>
            <p>
              A escolha vale enquanto você navega dentro do módulo financeiro. Ao sair e voltar, a pergunta é exibida novamente.
            </p>
          </Step>

          <Step number={2} title="Dashboard financeiro (/finance)">
            <ul className="list-inside list-disc space-y-1">
              <li>
                Mostra o <strong>saldo atual</strong>, <strong>entradas no mês</strong> e <strong>saídas no mês</strong>, com indicação do período (ex.: mês atual).
              </li>
              <li>
                Traz atalhos para <strong>Movimentações</strong> e <strong>Caixas</strong>, facilitando a navegação.
              </li>
              <li>
                Em caso de erro ao carregar, o botão <strong>Tentar novamente</strong> recarrega apenas os dados do dashboard.
              </li>
            </ul>
          </Step>

          <Step number={3} title="Caixas (/finance/caixas)">
            <ul className="list-inside list-disc space-y-1">
              <li>
                A lista exibe todos os <strong>caixas</strong> (ex.: Caixa principal, Caixa filial X), com <strong>nome, descrição, saldo calculado e status</strong>.
              </li>
              <li>
                Em modo <strong>admin</strong>:
                <ul className="list-inside list-disc pl-4">
                  <li>Clique em <strong>Novo caixa</strong> para criar (nome obrigatório, descrição opcional, ativo por padrão).</li>
                  <li>Use <strong>Editar</strong> em cada card para alterar nome, descrição ou ativar/inativar.</li>
                </ul>
              </li>
              <li>
                Em modo <strong>visitante</strong>, os botões de novo e editar não aparecem — você só vê os saldos e detalhes.
              </li>
            </ul>
          </Step>

          <Step number={4} title="Categorias financeiras (/finance/categorias)">
            <ul className="list-inside list-disc space-y-1">
              <li>
                As categorias são exibidas em formato de <strong>árvore</strong>, respeitando a hierarquia (categoria &rarr; subcategoria),
                separadas por tipo: <strong>Receita</strong> ou <strong>Despesa</strong>.
              </li>
              <li>
                Em modo <strong>admin</strong>:
                <ul className="list-inside list-disc pl-4">
                  <li>
                    Clique em <strong>Nova categoria</strong> para cadastrar (nome, tipo e opcionalmente escolher a categoria pai para criar subcategorias).
                  </li>
                  <li>
                    Use <strong>Editar</strong> em uma categoria para alterar nome, tipo ou mover para outra categoria pai.
                  </li>
                  <li>
                    Use <strong>Excluir</strong> apenas em categorias que não possuem subcategorias (o sistema bloqueia exclusão com filhos).
                  </li>
                </ul>
              </li>
              <li>
                Em modo <strong>visitante</strong>, você vê toda a árvore, mas não há botões de criar, editar ou excluir.
              </li>
            </ul>
          </Step>

          <Step number={5} title="Formas de pagamento (/finance/formas-pagamento)">
            <ul className="list-inside list-disc space-y-1">
              <li>
                Tela para gerenciar <strong>formas de pagamento</strong> usadas nas movimentações (Dinheiro, PIX, Cartão de crédito, Boleto, etc.).
              </li>
              <li>
                Em modo <strong>admin</strong>:
                <ul className="list-inside list-disc pl-4">
                  <li><strong>Nova forma de pagamento</strong>: exige apenas o nome.</li>
                  <li>
                    <strong>Editar</strong>: permite renomear a forma (desde que o nome não fique vazio).
                  </li>
                  <li>
                    <strong>Excluir</strong>: só é permitido se a forma <strong>não tiver sido usada</strong> em movimentações; caso contrário, o sistema mostra um erro explicando.
                  </li>
                </ul>
              </li>
              <li>Em modo <strong>visitante</strong>, a lista é apenas de leitura.</li>
            </ul>
          </Step>

          <Step number={6} title="Movimentações (/finance/movimentacoes)">
            <ul className="list-inside list-disc space-y-1">
              <li>
                Lista de todas as <strong>movimentações</strong> (entradas, saídas, transferências, sangrias e suprimentos), com filtros por:
                período, tipo, caixa e categoria.
              </li>
              <li>
                Em modo <strong>admin</strong>:
                <ul className="list-inside list-disc pl-4">
                  <li>
                    Botão <strong>Nova movimentação</strong>: abre o formulário para registrar entradas/saídas/transferências, escolhendo caixa(s), categoria, forma de pagamento, valor e descrição.
                  </li>
                  <li>
                    Em cada linha da tabela, os links <strong>Editar</strong> e <strong>Excluir</strong> permitem ajustar ou remover uma movimentação.
                  </li>
                  <li>
                    A paginação na parte inferior mostra quantos registros existem e permite navegar entre páginas.
                  </li>
                </ul>
              </li>
              <li>
                Em modo <strong>visitante</strong>, os filtros e a visualização da tabela permanecem disponíveis, mas os botões de
                <strong> Nova movimentação</strong>, <strong>Editar</strong> e <strong>Excluir</strong> são ocultados.
              </li>
            </ul>
          </Step>

          <Step number={7} title="Contas a pagar (/finance/contas-pagar)">
            <ul className="list-inside list-disc space-y-1">
              <li>
                Tela dividida em <strong>Pendentes</strong> e <strong>Pagas</strong>, com lista de contas a pagar (descrição, valor, vencimento,
                categoria, forma de pagamento e caixa).
              </li>
              <li>
                Em modo <strong>admin</strong>:
                <ul className="list-inside list-disc pl-4">
                  <li>
                    <strong>Nova conta a pagar</strong>: cria uma obrigação com valor, vencimento, categoria, forma de pagamento e caixa previsto.
                  </li>
                  <li>
                    <strong>Editar</strong>: permite alterar os dados enquanto a conta estiver pendente.
                  </li>
                  <li>
                    <strong>Quitar</strong>: abre um modal para escolher o caixa de débito; ao confirmar, é criada uma movimentação
                    de saída associada à conta, e o status muda para <strong>Paga</strong>.
                  </li>
                  <li>
                    Excluir (via tela de edição/detalhe) aplica um <strong>cancelamento lógico</strong> (status <code className="rounded bg-neutral-200 px-1 font-mono text-caption dark:bg-neutral-700">cancelled</code>),
                    sem remover o registro do banco.
                  </li>
                </ul>
              </li>
              <li>
                Em modo <strong>visitante</strong>, você acompanha todos os lançamentos (pendentes e pagos), mas não há botões de novo, editar ou quitar.
              </li>
            </ul>
          </Step>

          <Step number={8} title="Contas a receber (/finance/contas-receber)">
            <ul className="list-inside list-disc space-y-1">
              <li>
                Muito semelhante à tela de contas a pagar, porém para <strong>receitas futuras</strong>, com abas <strong>Pendentes</strong> e <strong>Recebidas</strong>.
              </li>
              <li>
                Em modo <strong>admin</strong>:
                <ul className="list-inside list-disc pl-4">
                  <li>
                    <strong>Nova conta a receber</strong>: registra um recebível com valor, vencimento, categoria, forma de pagamento e caixa previsto.
                  </li>
                  <li>
                    <strong>Editar</strong>: permite ajustar os dados enquanto a conta estiver pendente.
                  </li>
                  <li>
                    <strong>Receber</strong>: abre um modal para escolher o caixa de crédito; ao confirmar, é criada uma
                    movimentação de entrada vinculada à conta, e o status muda para <strong>Recebida</strong>.
                  </li>
                  <li>
                    Excluir (via tela de edição/detalhe) também faz um cancelamento lógico (status <code className="rounded bg-neutral-200 px-1 font-mono text-caption dark:bg-neutral-700">cancelled</code>).
                  </li>
                </ul>
              </li>
              <li>
                Em modo <strong>visitante</strong>, as listas continuam visíveis, mas sem botões de cadastrar, editar ou receber.
              </li>
            </ul>
          </Step>

          <Step number={9} title="Relatórios financeiros (/finance/relatorios)">
            <ul className="list-inside list-disc space-y-1">
              <li>
                Permite consultar relatórios consolidados de <strong>fluxo de caixa por mês</strong> (entradas, saídas e saldo)
                e <strong>receitas/despesas por categoria</strong>, em um período selecionado.
              </li>
              <li>
                Use o filtro de período (datas inicial e final) e clique em <strong>Aplicar</strong> para recarregar os dados.
              </li>
              <li>
                Tanto admins quanto visitantes podem usar os relatórios (são consultas de leitura).
              </li>
            </ul>
          </Step>

          <Step number={10} title="Auditoria do financeiro (/finance/auditoria)">
            <ul className="list-inside list-disc space-y-1">
              <li>
                Lista registros de <strong>auditoria</strong> para entidades financeiras:
                movimentações, caixas, categorias, formas de pagamento, contas a pagar e contas a receber.
              </li>
              <li>
                Cada linha mostra <strong>data/hora</strong>, <strong>ação</strong> (ex.: <code className="rounded bg-neutral-200 px-1 font-mono text-caption dark:bg-neutral-700">cashbox.updated</code>),
                <strong>tipo de entidade</strong>, <strong>ID</strong> e <strong>usuário</strong> (quando houver sessão).
              </li>
              <li>
                A auditoria é apenas leitura; tanto admin quanto visitante podem consultar o log.
              </li>
            </ul>
          </Step>

          <Step number={11} title="Chat &quot;IA Financeira&quot;">
            <ul className="list-inside list-disc space-y-1">
              <li>
                No canto inferior direito do módulo financeiro há um botão flutuante de chat com ícone de <strong>balão de mensagem</strong>.
                Ao clicar, abre-se o painel de <strong>IA Financeira</strong>.
              </li>
              <li>
                Sempre que o painel é aberto, ele consulta o <strong>dashboard financeiro</strong> para montar um contexto (saldo atual,
                entradas e saídas do mês, período), que é enviado para a IA junto com a sua pergunta.
              </li>
              <li>
                Basta digitar uma pergunta (por exemplo: <em>&quot;Como está o saldo?&quot;</em> ou <em>&quot;Quais categorias mais gastaram neste mês?&quot;</em>) e clicar em
                <strong> Enviar</strong>. A resposta é exibida logo abaixo, ou uma mensagem de erro se algo der errado.
              </li>
              <li>
                O chat é apenas de consulta; nenhuma ação de cadastro/edição é feita pela IA — ele serve como apoio analítico.
              </li>
            </ul>
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
                <span>Adição do módulo financeiro ao tutorial: acesso como admin/visitante, caixas, categorias, formas de pagamento, movimentações, contas a pagar/receber, relatórios, auditoria e chat de IA Financeira.</span>
              </li>
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
