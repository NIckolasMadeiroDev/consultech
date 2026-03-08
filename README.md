# Consultech - Gestão de Formulários Internos

Sistema de gestão de formulários com painel admin e link público para resposta. Next.js fullstack, Supabase (Postgres + pgvector), TDD.

## Stack

- **Frontend/Backend**: Next.js 14 (App Router, API Routes)
- **Estilo**: Tailwind CSS + Design System (tokens, dark mode, componentes UI)
- **ORM**: Prisma (PostgreSQL)
- **Banco**: Supabase Postgres
- **Auth admin**: tabela `admins` (email + senha com bcrypt), sessão JWT em cookie
- **Busca vetorial**: Supabase pgvector (IA)
- **Chat/IA**: xAI (Grok) via API
- **Validação**: Zod
- **Testes**: Vitest (TDD)
- **Logging**: Pino

## Estrutura (Clean Architecture)

```
src/
  app/                  # Rotas e páginas
    admin/              # Painel admin (protegido por sessão: tabela admins)
    login/              # Tela de login (email/senha contra tabela admins)
    r/[slug]/           # Link curto: redireciona para /forms/[id]/respond
    forms/[id]/respond  # Página pública de resposta (aceita anônimo e lógica condicional)
    api/                # API Routes
  components/          # Design System: ui/ (Button, Input, Card, Modal, Table), layout/ (Navbar, Sidebar)
  design-system/       # Tokens (colors, spacing, typography, radius, shadows)
  core/entities/       # Entidades de domínio
  hooks/               # useForms, useForm, useFormResponses, useDashboards, useDashboard
  lib/                 # api.ts (client), api-handler, logging
  modules/             # Por feature: forms, responses, dashboard, ai
  infrastructure/       # Prisma, repositórios
  types/               # Tipos globais
```

## Desenvolvimento

Crie um arquivo `.env` na raiz (ou copie de `.env.example`) com:

- `DATABASE_URL` — connection string do Postgres (Supabase):  
  `postgresql://postgres:SUA_SENHA@db.xxx.supabase.co:5432/postgres`
- `AUTH_SECRET` — segredo para assinar a sessão JWT do admin (mín. 32 caracteres)
- `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto Supabase (opcional; usado para outros recursos)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — chave anônima do Supabase (opcional)
- `XAI_API_KEY` — chave da API xAI (Grok)

Depois:

```bash
npm install
npm run db:generate
npm run db:push
npm run dev
```

## Testes (TDD)

```bash
npm run test
npm run test:coverage
```

## API

- `POST /api/auth/login` — Login admin (body: `{ email, password }`); define cookie de sessão
- `POST /api/auth/logout` — Logout; remove cookie
- `GET /api/auth/session` — Retorna o admin logado (a partir do cookie) ou `{ user: null }`
- `GET /api/forms?createdBy=...` — Lista formulários
- `POST /api/forms` — Cria formulário (body: createFormSchema)
- `GET /api/forms/[id]` — Formulário com perguntas (formWithQuestionsDTO)
- `GET /api/forms/by-slug/[slug]` — Formulário por slug (link curto)
- `PATCH /api/forms/[id]` — Atualiza formulário (body: updateFormSchema)
- `POST /api/forms/[id]/archive` — Arquivar formulário
- `POST /api/forms/[id]/duplicate` — Duplicar formulário
- `GET /api/forms/[id]/responses` — Respostas do formulário (com respondent e answers). Query: `page`, `limit` (paginação)
- `GET /api/forms/[id]/responses/summary` — Resumo: `{ count, lastSubmittedAt }`. Query opcional: `startDate`, `endDate` (ISO)
- `GET /api/dashboards?createdBy=...` — Lista dashboards
- `POST /api/dashboards` — Cria dashboard (body: createDashboardSchema)
- `GET /api/dashboards/[id]` — Um dashboard (apenas dono)
- `GET /api/dashboards/[id]/summary` — Resumo agregado: lista de formulários do dashboard com título, count e lastSubmittedAt. Query opcional: `startDate`, `endDate` (ISO)
- `PATCH /api/dashboards/[id]` — Atualiza dashboard (apenas dono; body: updateDashboardSchema)
- `DELETE /api/dashboards/[id]` — Exclui dashboard (apenas dono; 204)
- `POST /api/responses/submit` — Submete resposta (body: submitResponseSchema; respondent opcional se form.allowAnonymous)
- `POST /api/ai/chat` — Chat completion xAI (Grok)

## Banco de dados (Prisma + Supabase)

O schema fica em `prisma/schema.prisma`. Comandos:

- `npm run db:generate` — gera o Prisma Client
- `npm run db:push` — aplica o schema no banco (Supabase) sem criar arquivos de migration
- `npm run db:migrate` — cria e aplica migrations
- `npm run db:studio` — abre o Prisma Studio

Substitua `[YOUR-PASSWORD]` em `DATABASE_URL` no `.env` pela senha do Postgres do projeto Supabase.

## Admin e autenticação

O painel `/admin` usa a tabela `admins` (Prisma). Usuários admin são criados diretamente no banco (ex.: via Prisma Studio ou migration/seed). O campo `password_hash` deve conter senha em bcrypt; se estiver em texto puro, no primeiro login a senha é validada, hasheada com bcrypt e o registro é atualizado. Defina `AUTH_SECRET` no `.env` com pelo menos 32 caracteres (segredo para o JWT da sessão).

## Regras

- Sem comentários no código.
- SonarLint/SonarQube sem warnings.
- Testes escritos antes da implementação (TDD).

## Design System

Padronização visual (tipografia Inter, paleta primary/neutral, dark mode com `next-themes`). Tokens em `src/design-system/tokens/`; componentes em `src/components/ui/` e `src/components/layout/`. Uso obrigatório dos tokens (ex.: `text-primary-600`, `p-lg`) em vez de valores soltos. Ver `src/design-system/README.md`. Para catálogo de componentes: `npx storybook@latest init` (opcional).
