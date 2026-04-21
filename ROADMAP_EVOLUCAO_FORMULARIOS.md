# 📋 Roadmap: Evolução do Sistema de Formulários

## 🎯 Objetivo Geral
Transformar o sistema de formulários em uma plataforma com **personalização visual completa**, **contexto rico**, **análise de respostas ao nível do Google Forms** (vistas por pessoa e por pergunta, filtros), **organização tipo Drive**, **dashboards com dados reais** e **fluxos segmentados** — cobrindo as críticas sobre descrições, identidade visual, análise, pastas e gráficos.

---

## 📊 Visão Geral das Fases

| Fase | Nome | Prioridade | Complexidade | Impacto | Duração Estimada |
|------|------|------------|--------------|---------|------------------|
| 1 | Descrições e Contexto | 🔴 ALTA | ⭐⭐ Média | 🚀 Alto | 3-5 dias |
| 2 | Blocos de Conteúdo (incl. download de ficheiro) | 🟡 MÉDIA | ⭐⭐⭐ Alta | 🚀 Alto | 5-7 dias |
| 3 | Personalização Básica + Canvas | 🔴 ALTA | ⭐⭐⭐ Alta | 🚀🚀 Muito Alto | 8-12 dias |
| 4 | Personalização Avançada | 🟡 MÉDIA | ⭐⭐⭐ Alta | 🚀 Alto | 7-10 dias |
| 5 | Elementos Visuais | 🟢 BAIXA | ⭐⭐ Média | 🎨 Médio | 4-5 dias |
| 6 | UX e Polimento | 🟡 MÉDIA | ⭐⭐ Média | 🎨 Médio | 3-4 dias |
| 7 | Arquivos, anexos e “design system” do form | 🔴 ALTA | ⭐⭐⭐ Alta | 🚀🚀 Muito Alto | 6-9 dias |
| 8 | Identificação, links e experiência por passos (UX de resposta) | 🔴 ALTA | ⭐⭐⭐ Alta | 🚀🚀 Muito Alto | 8-12 dias |
| 9 | Visualização de respostas, filtros por área e secções condicionais | 🔴 ALTA | ⭐⭐⭐ Alta | 🚀🚀 Muito Alto | 8-12 dias |
| 10 | Pastas navegáveis (estilo Drive) e biblioteca de templates | 🟡 MÉDIA | ⭐⭐ Média | 🚀 Alto | 5-7 dias |
| 11 | Dashboards com gráficos/tabelas a partir das respostas + exportação | 🔴 ALTA | ⭐⭐⭐ Alta | 🚀🚀 Muito Alto | 8-11 dias |

**Tempo Total Estimado**: 65-94 dias úteis (inclui Fases 8–11 — análise, navegação e dashboards)

### Estado no repositório (revisão do código)

| Fase | Situação |
|------|----------|
| **1** — Descrições e contexto | Checklist principal marcada como feita; item **1.5 testes de acessibilidade** permanece aberto (sem suite a11y dedicada no repo). |
| **2** — Blocos de conteúdo | Implementada (rich text / markdown, imagem, vídeo, separador, `file_download` / `file_upload`, upload de imagens, validações na API). |
| **3** — Personalização básica + canvas | Implementada (migration `014`, `Form.theme` + imagens, editor de tema, rota `theme`, preview, `theme-utils`, `form-theme.css`, largura % e tokens). |
| **4** em diante | Pendentes conforme abaixo. |

Checklist **transversal** (pré-visualização com abas desktop/tablet/mobile, reset/duplicar tema, import/export JSON do tema, documentação de limites de upload): **não concluída** no código atual.

**Próxima fase na ordem do roadmap:** **Fase 4 — Personalização avançada** (templates de tema, Google Fonts, modo claro/escuro, patterns, import/export de tema, etc.).

---

## ⚠️ Reclamações de utilizadores → ajustes planejados (mapeamento)

Feedback recolhido sobre a **experiência de quem responde** o formulário público:

| Reclamação | Problema percebido | Ajuste no roadmap | Onde |
|------------|-------------------|-------------------|------|
| “Não há forma de não obrigar matrícula/e-mail” | O respondente não percebe se existe modo anónimo ou como desativar identificação | Definir **modo de identificação do respondente** ao nível do formulário (obrigatório / opcional / anónimo), com texto claro no admin e na página de resposta | **Fase 8** |
| “Não sei se era resposta anónima” | Falta de rótulo e de configuração explícita | Toggle + descrição “Respostas sem identificação” + mensagem ao respondente quando aplicável | **Fase 8** |
| “Não tem como inserir link” | Descrições e textos sem hiperligações clicáveis | Suporte a **URLs em textos** (markdown ou rich text) em títulos/descrições/ajuda; tipo de pergunta ou bloco **“link / URL”** opcional | **Fase 2** (conteúdo) + **Fase 8** (polimento e regras) |
| “Tudo aparece de uma vez, não como no Forms com passos” | Formulário longo numa única página; **secções não mudam o fluxo** | Modo de resposta: **uma página** vs **um passo por secção** (wizard) vs opcionalmente **um passo por pergunta**; botões Seguinte/Anterior; indicador de progresso | **Fase 8** |
| “Parece rascunho / secção não serve para nada” | Separação visual lógica sem navegação por secção | No modo por passos, cada secção = ecrã (ou bloco) com título visível; no modo página única, **âncoras** ou **separadores** mais fortes (opcional) | **Fase 8** (+ Fase 1 descrições) |
| Teste com outra conta | Comportamento igual para admin e externo — confirma que é o **comportamento atual do produto**, não bug de sessão | Documentar no admin: “Isto é o que o respondente vê”; **preview público** alinhado com o link partilhado | **Fase 6** + **Fase 8** |

**Prioridade sugerida para este conjunto**: implementar **Fase 8** cedo (em paralelo ou logo após Fase 1), porque impacta diretamente abandono e satisfação, sem depender de temas visuais.

---

## ⚠️ Reclamações — análise de respostas, pastas, templates e dashboard

Feedback sobre **área administrativa**, **visualização de dados** e **organização de formulários**:

| Reclamação | Problema percebido | Ajuste no roadmap | Onde |
|------------|-------------------|-------------------|------|
| “Queria mais de uma forma de ver as respostas” | Só há uma vista; falta flexibilidade | **Vista por membro** (lista de nomes → detalhe) + **vista por pergunta** (todas as respostas daquela pergunta, estilo Google Forms) + alternância explícita na UI | **Fase 9** |
| “Clicar no nome e ver as respostas da pessoa” | Navegação tipo lista → detalhe | Página ou painel **Resposta individual** com identificação clara; breadcrumbs | **Fase 9** |
| “Separar por área (marketing, comercial…) para guardiães” | Difícil analisar por equipa | **Filtros** por campo de perfil (área, departamento) na vista de respostas e/ou **segmentos no dashboard**; depende de dados no `Respondent` ou pergunta oculta/preenchida | **Fase 9** + **Fase 11** |
| “Secção só para quem é GP / avaliar projetistas” | Não existe **lógica de audiência** por secção | **Regras de visibilidade de secção** (ex.: com base em papel, matrícula, resposta a pergunta anterior, grupo) | **Fase 9** (ou sub-projeto “conditional sections”) |
| “Pastas parecem só título, não estilo Drive” | Falta navegação hierárquica clicável | **UI de pastas**: clicar na pasta → entra no conteúdo; breadcrumb; lista de forms dentro da pasta | **Fase 10** |
| “Template só aparece como ‘usar modelo’” | Falta espaço dedicado a modelos | **Pasta ou secção “Templates”** (biblioteca), filtros, pré-visualização | **Fase 10** |
| “Plataforma podia ter cores, fotos…” | Personalização global vs só forms | Já coberto em **Fase 3** (tema do form); opcional futuro: **tema da área admin** (fora do âmbito imediato deste doc) | **Fase 3** (+ nota) |
| “Dashboard não mostra gráficos com as respostas” | Só métricas de preenchimento/abandono; pouco valor com perguntas obrigatórias | **Gráficos e tabelas** por tipo de pergunta (escala, escolha única, texto agregado); **exportação** (Excel/CSV); **ocultar ou rebaixar** métricas pouco úteis (abandono por pergunta quando tudo obrigatório) | **Fase 11** |
| “Não monta tabela ou gráfico das respostas” | Falta agregação de conteúdo das respostas | Pipeline: respostas → agregação → Recharts/tabelas; alinhar com `dashboard_chart` existente se aplicável | **Fase 11** |
| Tutorial limitado | Utilizador não descobre capacidades | Atualizar **tutorial** e **empty states** quando Fase 11 existir | **Fase 6** |

**Prioridade sugerida**: **Fase 9** e **Fase 11** em alto valor para quem analisa dados; **Fase 10** melhora organização diária.

---

## 🎨 Matriz de personalização máxima do formulário (escopo ampliado)

Objetivo: o criador controla **quase tudo o que é visível e estrutural** na experiência de resposta — cores, imagens, tipografia, **percentagem da largura útil**, alinhamento, espaçamentos, estilo de campos, e **ficheiros** (PDF para download, anexos obrigatórios do respondente, ou ficheiros de referência).

| Área | O que personalizar | Onde vive (sugestão) | Notas |
|------|-------------------|----------------------|-------|
| **Cores** | Primária, secundária, fundo da página, fundo do cartão, texto, texto secundário, borda, foco (outline), erro, sucesso, link, barra de progresso | `Form.theme.colors` | Validar hex/hsl + contraste WCAG |
| **Imagens** | Logo, cabeçalho, fundo (cover/tile), favicon do form, watermark opcional | URLs + metadados no `theme` ou colunas dedicadas | Políticas de tamanho e formato |
| **Largura e canvas** | **Largura máxima do bloco do form em % da viewport** (ex.: 50%, 72%, 100%), `max-width` em px opcional, alinhamento (centro/esquerda), padding lateral da página | `Form.theme.layout` | Sliders + presets (estreito / médio / largo / full-bleed) |
| **Tipografia** | Família (Google/system), peso título/pergunta/ajuda, tamanhos escalonados (clamp), altura de linha, letter-spacing | `Form.theme.typography` | Não misturar demasiadas famílias |
| **Componentes** | Raio de borda global vs por componente (input, botão, card), espessura de borda, sombra, estilo do botão (filled/outline/ghost) | `Form.theme.components` | Tokens reutilizáveis |
| **Campos** | Cor de fundo do input, borda no foco, placeholder, altura mínima (textarea), densidade (compacto/confortável) | `Form.theme.fields` | Acessibilidade do foco |
| **Ficheiros no form** | (A) **Ficheiro estático** para o respondente (PDF, imagem) como recurso do form; (B) **Pergunta tipo upload** (respondente envia ficheiro); (C) **Anexo por pergunta** (ilustração) | `theme.assets` + novo tipo de pergunta + storage | Quotas, tipos MIME, antivírus, LGPD |
| **Comportamento visual** | Modo claro/escuro, overlay no fundo (opacidade), blur no backdrop | `Form.theme.effects` | Performance em mobile |
| **CSS avançado (opcional)** | Folha restrita ou lista de propriedades permitidas (safelist) em vez de CSS livre | `Form.theme.customCssAllowed` ou builder guiado | Evitar XSS; preferir tokens |

Checklist transversal (marca ao implementar):
- [ ] Editor com **pré-visualização** em desktop/tablet/mobile
- [ ] **Reset** para tema padrão + **duplicar tema** entre formulários
- [ ] **Importar/exportar** JSON do tema (já previsto na Fase 4; alinhar com Fase 3)
- [ ] Documentação de limites (tamanho máx. upload, formatos)

---

# 🚀 FASE 1: Descrições e Contexto
**Prioridade**: 🔴 ALTA | **Duração**: 3-5 dias | **Impacto**: Resolve 50% das críticas

## Objetivos
- ✅ Adicionar textos explicativos em seções
- ✅ Fornecer dicas e ajuda contextual
- ✅ Melhorar clareza e compreensão do formulário

## User Stories
1. **Como criador de formulário**, quero adicionar uma descrição para cada seção, para que os respondentes entendam o contexto antes de responder
2. **Como criador de formulário**, quero adicionar texto de ajuda em perguntas complexas, para reduzir erros de preenchimento
3. **Como respondente**, quero ver explicações sobre cada seção, para entender melhor o que está sendo solicitado

## Checklist de Implementação

### 1.1. Database & Schema
- [x] **Migration: `012_form_descriptions.sql`**
  ```sql
  -- Adicionar campos de descrição e ajuda no Question
  ALTER TABLE "Question" ADD COLUMN section_title TEXT;
  ALTER TABLE "Question" ADD COLUMN section_description TEXT;
  ALTER TABLE "Question" ADD COLUMN help_text TEXT;
  ALTER TABLE "Question" ADD COLUMN placeholder TEXT;
  ```

- [x] **Atualizar `prisma/schema.prisma`**
  ```typescript
  model Question {
    // ... campos existentes
    sectionTitle       String? @map("section_title")
    sectionDescription String? @map("section_description")
    helpText           String? @map("help_text")
    placeholder        String?
  }
  ```

- [x] **Rodar `npx prisma generate`**
- [x] **Adicionar migration ao script `scripts/apply-supabase-migrations.mjs`**

### 1.2. Backend APIs
Nenhuma alteração necessária (campos opcionais já serão retornados pelas APIs existentes)

### 1.3. Frontend - Editor de Formulários

- [x] **Atualizar `src/app/admin/forms/[id]/edit/page.tsx`**
  - Adicionar campos para `sectionTitle` e `sectionDescription` no editor
  - Adicionar campo `helpText` em cada pergunta
  - Adicionar campo `placeholder` para tipos de input

- [x] **Criar componente `src/components/forms/section-header-editor.tsx`**
  ```typescript
  export function SectionHeaderEditor({
    sectionTitle,
    sectionDescription,
    onChange
  }: SectionHeaderEditorProps) {
    // Editor para título e descrição da seção
    // Textarea com contador de caracteres
    // Preview inline opcional
  }
  ```

- [x] **Criar componente `src/components/forms/help-text-editor.tsx`**
  ```typescript
  export function HelpTextEditor({
    helpText,
    placeholder,
    onChange
  }: HelpTextEditorProps) {
    // Campo para texto de ajuda
    // Campo para placeholder
    // Ícone de informação para preview
  }
  ```

### 1.4. Frontend - Visualização Pública

- [x] **Atualizar `src/app/forms/[id]/respond/page.tsx`**
  - Renderizar `sectionTitle` como cabeçalho de seção
  - Renderizar `sectionDescription` abaixo do título
  - Mostrar ícone de ajuda com tooltip para `helpText`
  - Aplicar `placeholder` nos inputs

- [x] **Criar componente `src/components/forms/section-header.tsx`**
  ```typescript
  export function SectionHeader({
    title,
    description
  }: SectionHeaderProps) {
    // Renderiza título da seção (H3)
    // Renderiza descrição com formatação básica
    // Espaçamento adequado
  }
  ```

- [x] **Criar componente `src/components/forms/question-help.tsx`**
  ```typescript
  export function QuestionHelp({
    helpText
  }: QuestionHelpProps) {
    // Ícone de informação (?)
    // Tooltip/Popover com texto de ajuda
    // Acessível via teclado
  }
  ```

### 1.5. Testes e Validação

- [x] **Testes de integração**
  - Criar formulário com seções e descrições
  - Verificar renderização correta na página pública
  - Testar com diferentes tamanhos de texto

- [ ] **Testes de acessibilidade**
  - Navegação por teclado nos tooltips
  - Leitores de tela conseguem ler as descrições
  - Contraste adequado

### 1.6. Arquivos Afetados

```
Novos:
- supabase/migrations/012_form_descriptions.sql
- src/components/forms/section-header-editor.tsx
- src/components/forms/help-text-editor.tsx
- src/components/forms/section-header.tsx
- src/components/forms/question-help.tsx

Modificados:
- prisma/schema.prisma
- scripts/apply-supabase-migrations.mjs
- src/app/admin/forms/[id]/edit/page.tsx
- src/app/forms/[id]/respond/page.tsx
```

### 1.7. Critérios de Aceitação

✅ **Editor de formulários**:
- Campos visíveis e funcionais para título/descrição de seção
- Campo de help text para cada pergunta
- Campo de placeholder para inputs de texto

✅ **Visualização pública**:
- Seções exibem título e descrição claramente
- Ícone de ajuda visível ao lado de perguntas com helpText
- Tooltip/popover mostra o texto de ajuda ao clicar/hover
- Placeholders aparecem nos campos de input

✅ **Qualidade**:
- Build sem erros
- Sem erros de lint
- Responsivo em mobile/tablet/desktop

---

# 🎨 FASE 2: Blocos de Conteúdo
**Prioridade**: 🟡 MÉDIA | **Duração**: 5-7 dias | **Impacto**: Flexibilidade máxima

## Objetivos
- ✅ Permitir adicionar blocos de conteúdo entre perguntas
- ✅ Suporte a texto rico, imagens e vídeos
- ✅ Criar separadores visuais

## User Stories
1. **Como criador**, quero adicionar blocos de texto explicativo entre perguntas, para fornecer instruções detalhadas
2. **Como criador**, quero inserir imagens e vídeos no formulário, para ilustrar conceitos
3. **Como criador**, quero adicionar separadores visuais, para organizar melhor o formulário

## Checklist de Implementação

### 2.1. Database & Schema

- [x] **Migration: `013_content_blocks.sql`**
  ```sql
  -- Adicionar novos tipos de questão
  -- Adicionar campos para conteúdo rico
  ALTER TABLE "Question" ADD COLUMN image_url TEXT;
  ALTER TABLE "Question" ADD COLUMN video_url TEXT;
  ALTER TABLE "Question" ADD COLUMN content_html TEXT;
  
  -- Atualizar constraint de questionType (se existir)
  -- Novos tipos: 'text_block', 'markdown_block', 'separator', 'image_block', 'video_block', 'file_download' (recurso estático), 'file_upload' (respondente anexa ficheiro)
  ```

- [x] **Atualizar `prisma/schema.prisma`**
  ```typescript
  model Question {
    // ... campos existentes
    imageUrl    String? @map("image_url")
    videoUrl    String? @map("video_url")
    contentHtml String? @map("content_html")
    
    // questionType agora aceita:
    // "text_block" | "markdown_block" | "separator" | "image_block" | "video_block" | "file_download" | "file_upload"
  }
  ```

### 2.2. Backend APIs

- [x] **Atualizar validação em `src/app/api/forms/[id]/route.ts`**
  - Permitir novos tipos de questão
  - Validar campos específicos de cada tipo
  - `text_block` / `markdown_block` requer `contentHtml`
  - `image_block` requer `imageUrl`
  - `video_block` requer `videoUrl`
  - `file_download` requer URL segura do ficheiro + nome legível + tipo MIME (PDF, imagem, etc.)
  - `file_upload` define regras: extensões permitidas, tamanho máx., obrigatório/opcional, número máx. de ficheiros

### 2.3. Frontend - Editor de Formulários

- [x] **Criar `src/components/forms/question-type-selector.tsx`**
  - Adicionar novos tipos ao seletor
  - Ícones específicos para cada tipo de bloco
  - Agrupamento: "Perguntas" vs "Blocos de Conteúdo"

- [x] **Criar `src/components/forms/blocks/text-block-editor.tsx`**
  ```typescript
  export function TextBlockEditor({
    content,
    onChange
  }: TextBlockEditorProps) {
    // Rich text editor (TipTap, Quill, ou similar)
    // Barra de ferramentas: negrito, itálico, listas, links
    // Preview do conteúdo
  }
  ```

- [x] **Criar `src/components/forms/blocks/image-block-editor.tsx`**
  ```typescript
  export function ImageBlockEditor({
    imageUrl,
    onChange
  }: ImageBlockEditorProps) {
    // Upload de imagem OU URL externa
    // Preview da imagem
    // Campo de alt text para acessibilidade
    // Opções de tamanho (pequeno, médio, grande, full-width)
  }
  ```

- [x] **Criar `src/components/forms/blocks/video-block-editor.tsx`**
  ```typescript
  export function VideoBlockEditor({
    videoUrl,
    onChange
  }: VideoBlockEditorProps) {
    // Input para URL do YouTube/Vimeo
    // Preview do vídeo embarcado
    // Validação de URL
  }
  ```

- [x] **Criar `src/components/forms/blocks/separator-editor.tsx`**
  ```typescript
  export function SeparatorEditor({
    style,
    onChange
  }: SeparatorEditorProps) {
    // Seletor de estilo: linha sólida, tracejada, pontilhada
    // Seletor de espessura
    // Preview do separador
  }
  ```

- [x] **Instalar dependências**
  ```bash
  npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link
  ```

### 2.4. Frontend - Visualização Pública

- [x] **Atualizar `src/app/forms/[id]/respond/page.tsx`**
  - Renderizar diferentes tipos de blocos
  - Blocos de conteúdo não geram campos de resposta

- [x] **Criar `src/components/forms/blocks/text-block-display.tsx`**
  ```typescript
  export function TextBlockDisplay({
    content
  }: TextBlockDisplayProps) {
    // Renderiza HTML sanitizado
    // Estilos consistentes com o tema do formulário
  }
  ```

- [x] **Criar `src/components/forms/blocks/image-block-display.tsx`**
  ```typescript
  export function ImageBlockDisplay({
    imageUrl,
    altText
  }: ImageBlockDisplayProps) {
    // Imagem responsiva
    // Lazy loading
    // Lightbox opcional ao clicar
  }
  ```

- [x] **Criar `src/components/forms/blocks/video-block-display.tsx`**
  ```typescript
  export function VideoBlockDisplay({
    videoUrl
  }: VideoBlockDisplayProps) {
    // Embed do YouTube/Vimeo
    // Responsivo (16:9)
    // Poster/thumbnail
  }
  ```

- [x] **Criar `src/components/forms/blocks/separator-display.tsx`**
  ```typescript
  export function SeparatorDisplay({
    style
  }: SeparatorDisplayProps) {
    // Linha horizontal com estilo escolhido
    // Margens adequadas
  }
  ```

### 2.5. Upload de Imagens

- [x] **Criar `src/app/api/upload/image/route.ts`**
  ```typescript
  export async function POST(req: NextRequest) {
    // Validar tamanho (max 5MB)
    // Validar tipo (jpg, png, gif, webp)
    // Upload para Supabase Storage ou serviço externo
    // Retornar URL pública
  }
  ```

- [x] **Configurar Supabase Storage**
  - Criar bucket "form-images"
  - Configurar políticas de acesso público para leitura
  - Configurar limite de tamanho

### 2.6. Testes e Validação

- [x] **Testes funcionais**
  - Criar formulário com todos os tipos de blocos
  - Verificar renderização correta
  - Testar upload de imagens
  - Testar embeds de vídeo

- [x] **Testes de segurança**
  - Sanitização de HTML (prevenir XSS)
  - Validação de URLs de vídeo
  - Validação de upload de imagens

### 2.7. Arquivos Afetados

```
Novos:
- supabase/migrations/013_content_blocks.sql
- src/components/forms/question-type-selector.tsx
- src/components/forms/blocks/text-block-editor.tsx
- src/components/forms/blocks/text-block-display.tsx
- src/components/forms/blocks/image-block-editor.tsx
- src/components/forms/blocks/image-block-display.tsx
- src/components/forms/blocks/video-block-editor.tsx
- src/components/forms/blocks/video-block-display.tsx
- src/components/forms/blocks/separator-editor.tsx
- src/components/forms/blocks/separator-display.tsx
- src/app/api/upload/image/route.ts

Modificados:
- prisma/schema.prisma
- scripts/apply-supabase-migrations.mjs
- src/app/api/forms/[id]/route.ts
- src/app/admin/forms/[id]/edit/page.tsx
- src/app/forms/[id]/respond/page.tsx
```

### 2.8. Critérios de Aceitação

✅ **Editor**:
- Adicionar blocos de texto, imagem, vídeo e separador
- Rich text editor funcional com formatação básica
- Upload de imagens funcionando
- Preview de todos os blocos

✅ **Visualização**:
- Todos os tipos de blocos renderizam corretamente
- Imagens responsivas e com lazy loading
- Vídeos embarcados corretamente
- HTML sanitizado (sem XSS)

✅ **Segurança**:
- Validação de uploads
- Sanitização de HTML
- URLs de vídeo validadas

---

# 🎨 FASE 3: Personalização Básica
**Prioridade**: 🔴 ALTA | **Duração**: 4-6 dias | **Impacto**: Resolve outros 40% das críticas

## Objetivos
- ✅ Sistema de temas com **paleta completa** (cores de superfície, texto, estados, componentes)
- ✅ **Tipografia** (família, pesos, tamanhos escalonados, interlinha)
- ✅ **Layout e canvas**: largura do formulário em **% da viewport** (e/ou px), alinhamento, margens da página
- ✅ Upload de logo, cabeçalho, fundo e outros assets
- ✅ Estilização de **inputs, botões, cards** via tokens no `theme`
- ✅ Preview em tempo real (alinhado com Fase 6 para breakpoints)

## User Stories
1. **Como criador**, quero escolher cores e fontes, para alinhar com a identidade visual da organização
2. **Como criador**, quero definir **quantos % da largura do ecrã** o formulário ocupa (ex.: 60% centrado), para não parecer “flutuando” nem “esticado demais”
3. **Como criador**, quero fazer upload de logo e imagens de branding
4. **Como criador**, quero ver preview em tempo real das mudanças
5. **Como criador**, quero anexar um **PDF ou imagem de apoio** ao formulário e/ou pedir **upload de ficheiro** ao respondente (ver Fase 7)

## Checklist de Implementação

### 3.1. Database & Schema

- [x] **Migration: `014_form_themes.sql`**
  ```sql
  -- Adicionar campos de personalização visual
  ALTER TABLE "Form" ADD COLUMN theme JSONB DEFAULT '{}';
  ALTER TABLE "Form" ADD COLUMN header_image TEXT;
  ALTER TABLE "Form" ADD COLUMN logo_image TEXT;
  ALTER TABLE "Form" ADD COLUMN background_image TEXT;
  
  -- Adicionar campos de textos customizáveis
  ALTER TABLE "Form" ADD COLUMN welcome_message TEXT;
  ALTER TABLE "Form" ADD COLUMN submit_button_text TEXT DEFAULT 'Enviar';
  ALTER TABLE "Form" ADD COLUMN success_message TEXT;
  -- Opcional: coluna dedicada para ficheiros de referência (lista JSON de URLs + metadados)
  -- ALTER TABLE "Form" ADD COLUMN static_assets JSONB DEFAULT '[]';
  
  -- Índice para performance
  CREATE INDEX IF NOT EXISTS idx_form_theme ON "Form" USING GIN (theme);
  ```
  
  O campo `theme` (JSONB) deve suportar estrutura expandida, por exemplo:
  - `layout.containerWidthPercent` (10–100), `layout.maxWidthPx`, `layout.align`, `layout.pagePadding`
  - `typography.headingFont`, `typography.bodyFont`, `typography.scale`, `typography.lineHeight`
  - `colors.*` (tokens semânticos)
  - `components.button`, `components.card`, `components.input`
  - `effects.backgroundOverlayOpacity`, `effects.backgroundBlur`

- [x] **Atualizar `prisma/schema.prisma`**
  ```typescript
  model Form {
    // ... campos existentes
    theme             Json     @default("{}")
    headerImage       String?  @map("header_image")
    logoImage         String?  @map("logo_image")
    backgroundImage   String?  @map("background_image")
    welcomeMessage    String?  @map("welcome_message")
    submitButtonText  String   @default("Enviar") @map("submit_button_text")
    successMessage    String?  @map("success_message")
  }
  ```

### 3.2. Type Definitions

- [x] **Criar `src/types/form-theme.ts`** (tokens completos; versão mínima pode ser um subset)
  ```typescript
  export interface FormTheme {
    colors: {
      primary: string;
      secondary: string;
      pageBackground: string;
      surfaceBackground: string;
      textPrimary: string;
      textSecondary: string;
      border: string;
      focusRing: string;
      link: string;
      success: string;
      error: string;
      progressTrack: string;
      progressFill: string;
    };
    typography: {
      headingFont: string;
      bodyFont: string;
      headingWeight: number;
      bodyWeight: number;
      baseSize: string;
      scale: 'sm' | 'md' | 'lg';
      lineHeight: string;
      letterSpacing?: string;
    };
    layout: {
      containerWidthPercent: number;
      maxWidthPx?: number;
      align: 'start' | 'center';
      pagePaddingX: string;
      pagePaddingY: string;
      cardPadding: string;
      questionGap: string;
      sectionGap: string;
    };
    components: {
      borderRadiusSm: string;
      borderRadiusMd: string;
      borderRadiusLg: string;
      buttonVariant: 'filled' | 'outline' | 'ghost';
      cardShadow: 'none' | 'sm' | 'md' | 'lg';
      inputBorderWidth: string;
    };
    fields: {
      inputBackground: string;
      inputBorder: string;
      inputFocusBorder: string;
      density: 'compact' | 'comfortable';
    };
    effects: {
      backgroundOverlayOpacity: number;
      backgroundBlurPx: number;
    };
    legacy?: {
      primaryColor?: string;
      backgroundColor?: string;
      textColor?: string;
      accentColor?: string;
      borderColor?: string;
      fontFamily?: string;
      fontSize?: string;
      borderRadius?: string;
      spacing?: string;
      shadowEnabled?: boolean;
      shadowIntensity?: 'none' | 'light' | 'medium' | 'strong';
    };
  }
  
  export const DEFAULT_THEME: FormTheme = {
    colors: {
      primary: '#4F46E5',
      secondary: '#6366F1',
      pageBackground: '#F3F4F6',
      surfaceBackground: '#FFFFFF',
      textPrimary: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      focusRing: '#4F46E5',
      link: '#2563EB',
      success: '#059669',
      error: '#DC2626',
      progressTrack: '#E5E7EB',
      progressFill: '#4F46E5',
    },
    typography: {
      headingFont: 'Inter, system-ui, sans-serif',
      bodyFont: 'Inter, system-ui, sans-serif',
      headingWeight: 600,
      bodyWeight: 400,
      baseSize: '16px',
      scale: 'md',
      lineHeight: '1.5',
    },
    layout: {
      containerWidthPercent: 72,
      maxWidthPx: 720,
      align: 'center',
      pagePaddingX: '1rem',
      pagePaddingY: '2rem',
      cardPadding: '1.25rem',
      questionGap: '1rem',
      sectionGap: '2rem',
    },
    components: {
      borderRadiusSm: '4px',
      borderRadiusMd: '8px',
      borderRadiusLg: '12px',
      buttonVariant: 'filled',
      cardShadow: 'sm',
      inputBorderWidth: '1px',
    },
    fields: {
      inputBackground: '#FFFFFF',
      inputBorder: '#E5E7EB',
      inputFocusBorder: '#4F46E5',
      density: 'comfortable',
    },
    effects: {
      backgroundOverlayOpacity: 0,
      backgroundBlurPx: 0,
    },
  };
  ```

### 3.3. Backend APIs

- [x] **Atualizar `src/app/api/forms/[id]/route.ts` (PATCH)**
  - Validar estrutura do objeto `theme`
  - Validar URLs de imagens
  - Validar cores (formato hex)

- [x] **Criar `src/app/api/forms/[id]/theme/route.ts`**
  ```typescript
  export async function PATCH(req: NextRequest, { params }) {
    // Endpoint dedicado para atualizar apenas o tema
    // Validação de cores, fontes, etc.
    // Retorna tema atualizado
  }
  ```

### 3.4. Frontend - Editor de Temas

- [x] **Criar `src/app/admin/forms/[id]/theme/page.tsx`**
  ```typescript
  export default function FormThemePage({ params }) {
    // Página dedicada para editar tema do formulário
    // Split screen: editor à esquerda, preview à direita
    // Botão "Salvar tema"
  }
  ```

- [x] **Criar `src/components/forms/theme-editor/theme-editor.tsx`**
  ```typescript
  export function ThemeEditor({
    theme,
    onChange
  }: ThemeEditorProps) {
    // Painel de controle completo do tema
    // Abas sugeridas: Cores | Tipografia | Layout & % largura | Componentes | Imagens | Efeitos
  }
  ```

- [x] **Criar `src/components/forms/theme-editor/color-picker-section.tsx`**
  ```typescript
  export function ColorPickerSection({
    colors,
    onChange
  }: ColorPickerSectionProps) {
    // Color pickers para cada cor
    // Preview de paleta
    // Sugestões de paletas harmoniosas
    // Validador de contraste (WCAG)
  }
  ```

- [x] **Criar `src/components/forms/theme-editor/typography-section.tsx`**
  ```typescript
  export function TypographySection({
    fontFamily,
    fontSize,
    onChange
  }: TypographySectionProps) {
    // Seletor de fontes (Google Fonts)
    // Slider de tamanho de fonte
    // Preview de texto
  }
  ```

- [x] **Criar `src/components/forms/theme-editor/layout-section.tsx`**
  ```typescript
  export function LayoutSection({
    borderRadius,
    spacing,
    shadow,
    onChange
  }: LayoutSectionProps) {
    // Controle de border-radius
    // Controle de espaçamento
    // Toggle de sombras
  }
  ```

- [x] **Criar `src/components/forms/theme-editor/images-section.tsx`**
  ```typescript
  export function ImagesSection({
    logoImage,
    headerImage,
    backgroundImage,
    onChange
  }: ImagesSectionProps) {
    // Upload de logo
    // Upload de header
    // Upload de background
    // Preview de cada imagem
  }
  ```

- [x] **Criar `src/components/forms/theme-editor/form-preview.tsx`**
  ```typescript
  export function FormPreview({
    form,
    theme
  }: FormPreviewProps) {
    // Preview do formulário com tema aplicado
    // Iframe ou componente isolado
    // Atualização em tempo real
  }
  ```

- [x] **Instalar dependências**
  ```bash
  npm install react-colorful
  ```

### 3.5. Frontend - Aplicação do Tema

- [x] **Criar `src/lib/theme-utils.ts`**
  ```typescript
  export function applyFormTheme(theme: FormTheme): React.CSSProperties {
    // Converte FormTheme para CSS variables
    return {
      '--form-primary-color': theme.primaryColor,
      '--form-bg-color': theme.backgroundColor,
      '--form-text-color': theme.textColor,
      '--form-accent-color': theme.accentColor,
      '--form-border-color': theme.borderColor,
      '--form-font-family': theme.fontFamily,
      '--form-font-size': theme.fontSize,
      '--form-border-radius': theme.borderRadius,
      // ... outras variáveis
    } as React.CSSProperties;
  }
  
  export function generateThemeCSS(theme: FormTheme): string {
    // Gera CSS inline para aplicar tema
    // Usado no componente de resposta pública
  }
  ```

- [x] **Atualizar `src/app/forms/[id]/respond/page.tsx`**
  ```typescript
  // Aplicar tema ao carregar formulário
  const themeStyles = applyFormTheme(form.theme);
  
  return (
    <div style={themeStyles} className="form-container">
      {form.logoImage && <img src={form.logoImage} alt="Logo" />}
      {form.welcomeMessage && <p>{form.welcomeMessage}</p>}
      {/* ... resto do formulário */}
    </div>
  );
  ```

- [x] **Criar `src/styles/form-theme.css`**
  ```css
  /* CSS base que usa variáveis do tema */
  .form-container {
    background-color: var(--form-bg-color);
    color: var(--form-text-color);
    font-family: var(--form-font-family);
    font-size: var(--form-font-size);
  }
  
  .form-button {
    background-color: var(--form-primary-color);
    border-radius: var(--form-border-radius);
  }
  
  /* ... mais estilos */
  ```

### 3.5b. Editor — Largura em % da tela e alinhamento (“canvas”)

- [x] **Criar `src/components/forms/theme-editor/layout-canvas-section.tsx`**
  - Slider **“Largura do formulário (% da janela)”** com range seguro (ex.: 40–100) e presets (50 / 66 / 80 / 100)
  - Campo opcional **max-width em px** para não esticar linhas de texto infinitamente em monitores ultra-largos
  - **Alinhamento**: bloco do form à esquerda ou centrado na página
  - **Padding da página** (horizontal / vertical) em rem ou px
  - Preview mostra a moldura real (área útil vs fundo da página)

- [x] **Aplicar no respondente**
  - Wrapper com `width: min(${percent}vw, ${maxWidthPx}px)` ou equivalente em CSS variables
  - `margin-inline: auto` quando `align: center`

### 3.5c. Editor — Cores expandidas e estilos de componente

- [x] **Estender `color-picker-section.tsx`** (ou dividir em sub-abas)
  - Tokens: superfície da página, superfície do cartão, texto primário/secundário, borda, foco, link, estados de erro/sucesso, barra de progresso
  - Modo “**harmonizar automaticamente**” a partir da cor primária (geração de paleta — opcional Fase 4)

- [x] **Criar `src/components/forms/theme-editor/component-tokens-section.tsx`**
  - Raio global vs raio por botão/input/card
  - Variante do botão (filled / outline / ghost)
  - Sombra do card (none → lg)
  - Densidade dos campos (compacto / confortável)

### 3.5d. Editor — Tipografia avançada

- [x] **Estender `typography-section.tsx`**
  - Fonte de **títulos** vs **corpo** (podem ser famílias diferentes)
  - Pesos (400–700), escala tipográfica (sm/md/lg) mapeada para `clamp()` no CSS
  - Interlinha e letter-spacing opcionais
  - Pré-visualização de parágrafo + título + label de pergunta

### 3.6. Navegação e UX

- [x] **Atualizar menu de edição do formulário**
  - Adicionar link "Tema e Aparência" ou aba no editor
  - Ícone de paleta/pincel

- [x] **Adicionar shortcuts**
  - Botão "Personalizar tema" visível no editor principal

### 3.7. Testes e Validação

- [x] **Testes funcionais**
  - Alterar cores e verificar preview
  - Upload de imagens
  - Salvar e carregar tema
  - Aplicar tema na página pública

- [x] **Testes de acessibilidade**
  - Contraste de cores adequado
  - Fontes legíveis
  - Funciona com leitores de tela

- [x] **Testes de performance**
  - Preview não trava com muitas mudanças
  - Imagens otimizadas

### 3.8. Arquivos Afetados

```
Novos:
- supabase/migrations/014_form_themes.sql
- src/types/form-theme.ts
- src/app/admin/forms/[id]/theme/page.tsx
- src/app/api/forms/[id]/theme/route.ts
- src/components/forms/theme-editor/theme-editor.tsx
- src/components/forms/theme-editor/color-picker-section.tsx
- src/components/forms/theme-editor/typography-section.tsx
- src/components/forms/theme-editor/layout-section.tsx
- src/components/forms/theme-editor/layout-canvas-section.tsx
- src/components/forms/theme-editor/component-tokens-section.tsx
- src/components/forms/theme-editor/images-section.tsx
- src/components/forms/theme-editor/form-preview.tsx
- src/lib/theme-utils.ts
- src/styles/form-theme.css

Modificados:
- prisma/schema.prisma
- scripts/apply-supabase-migrations.mjs
- src/app/api/forms/[id]/route.ts
- src/app/forms/[id]/respond/page.tsx
- src/app/admin/forms/[id]/edit/page.tsx (adicionar link para tema)
```

### 3.9. Critérios de Aceitação

✅ **Editor de temas**:
- Interface intuitiva com abas organizadas (inclui **% de largura**, tipografia avançada, tokens de componentes)
- Color pickers funcionais (paleta semântica completa)
- Upload de imagens funcionando
- Preview em tempo real
- Validação de contraste de cores

✅ **Aplicação do tema**:
- Tema aplicado corretamente na página pública
- **Largura do bloco do formulário** reflete `containerWidthPercent` + `maxWidthPx` + alinhamento
- Todas as cores, tipografia e tokens de inputs/botões/cards respeitados
- Imagens de branding exibidas
- Responsivo em todos os dispositivos

✅ **Performance**:
- Preview atualiza sem delay
- Sem re-renders desnecessários
- Imagens carregam rapidamente

---

# 🎨 FASE 4: Personalização Avançada
**Prioridade**: 🟡 MÉDIA | **Duração**: 7-10 dias | **Impacto**: Diferenciação competitiva

## Objetivos
- ✅ Templates de temas pré-prontos
- ✅ Seleção de fontes do Google Fonts
- ✅ Modo claro/escuro
- ✅ Background patterns

## Checklist de Implementação

### 4.1. Templates de Temas

- [ ] **Criar `src/lib/theme-templates.ts`**
  ```typescript
  export const THEME_TEMPLATES = {
    professional: {
      name: 'Profissional',
      description: 'Elegante e corporativo',
      theme: {
        primaryColor: '#2563EB',
        backgroundColor: '#F9FAFB',
        // ... resto do tema
      }
    },
    creative: {
      name: 'Criativo',
      description: 'Cores vibrantes e modernas',
      theme: { /* ... */ }
    },
    minimalist: {
      name: 'Minimalista',
      description: 'Simples e limpo',
      theme: { /* ... */ }
    },
    dark: {
      name: 'Modo Escuro',
      description: 'Para ambientes com pouca luz',
      theme: { /* ... */ }
    },
    corporate: {
      name: 'Corporativo',
      description: 'Sério e confiável',
      theme: { /* ... */ }
    }
  };
  ```

- [ ] **Criar `src/components/forms/theme-editor/template-selector.tsx`**
  ```typescript
  export function TemplateSelector({
    onSelectTemplate
  }: TemplateSelectorProps) {
    // Grid de templates
    // Preview de cada template
    // Botão "Aplicar" em cada um
    // Confirmação antes de aplicar (sobrescreve customizações)
  }
  ```

### 4.2. Google Fonts Integration

- [ ] **Criar `src/lib/google-fonts.ts`**
  ```typescript
  export const POPULAR_FONTS = [
    { name: 'Inter', category: 'sans-serif' },
    { name: 'Roboto', category: 'sans-serif' },
    { name: 'Open Sans', category: 'sans-serif' },
    { name: 'Lato', category: 'sans-serif' },
    { name: 'Montserrat', category: 'sans-serif' },
    { name: 'Poppins', category: 'sans-serif' },
    { name: 'Playfair Display', category: 'serif' },
    { name: 'Merriweather', category: 'serif' },
    { name: 'Source Code Pro', category: 'monospace' },
  ];
  
  export function loadGoogleFont(fontName: string) {
    // Carrega fonte dinamicamente do Google Fonts
    // Adiciona link tag no head
  }
  ```

- [ ] **Criar `src/components/forms/theme-editor/font-selector.tsx`**
  ```typescript
  export function FontSelector({
    selectedFont,
    onChange
  }: FontSelectorProps) {
    // Dropdown com fontes populares
    // Preview de cada fonte
    // Campo de busca para outras fontes
    // Carregamento dinâmico de preview
  }
  ```

### 4.3. Modo Claro/Escuro

- [ ] **Atualizar `src/types/form-theme.ts`**
  ```typescript
  export interface FormTheme {
    // ... campos existentes
    mode: 'light' | 'dark' | 'auto';
    darkMode?: {
      primaryColor: string;
      backgroundColor: string;
      textColor: string;
      // ... outras cores para modo escuro
    };
  }
  ```

- [ ] **Criar `src/lib/theme-dark-mode.ts`**
  ```typescript
  export function generateDarkModeTheme(lightTheme: FormTheme): FormTheme {
    // Gera versão escura automaticamente
    // Inverte cores mantendo contraste
    // Ajusta saturação e brilho
  }
  
  export function applyDarkMode(theme: FormTheme, isDark: boolean): FormTheme {
    // Retorna tema claro ou escuro baseado em preferência
  }
  ```

- [ ] **Criar toggle de modo escuro no preview**

### 4.4. Background Patterns

- [ ] **Criar `src/lib/background-patterns.ts`**
  ```typescript
  export const BACKGROUND_PATTERNS = {
    none: { name: 'Nenhum', pattern: null },
    dots: { name: 'Pontos', pattern: 'url(/patterns/dots.svg)' },
    grid: { name: 'Grade', pattern: 'url(/patterns/grid.svg)' },
    waves: { name: 'Ondas', pattern: 'url(/patterns/waves.svg)' },
    geometric: { name: 'Geométrico', pattern: 'url(/patterns/geometric.svg)' },
  };
  ```

- [ ] **Criar patterns SVG em `public/patterns/`**
  - dots.svg
  - grid.svg
  - waves.svg
  - geometric.svg

- [ ] **Adicionar seletor de pattern no editor**

### 4.5. Espaçamentos Avançados

- [ ] **Atualizar tipo de tema com mais opções**
  ```typescript
  export interface FormTheme {
    // ... campos existentes
    layout: {
      maxWidth: string;           // Largura máxima do formulário
      padding: string;            // Padding interno
      questionSpacing: string;    // Espaço entre perguntas
      sectionSpacing: string;     // Espaço entre seções
    };
  }
  ```

- [ ] **Criar controles deslizantes para espaçamentos**

### 4.6. Exportar/Importar Temas

- [ ] **Criar `src/app/api/forms/[id]/theme/export/route.ts`**
  ```typescript
  export async function GET(req: NextRequest, { params }) {
    // Exporta tema como JSON
    // Download automático
  }
  ```

- [ ] **Criar `src/app/api/forms/[id]/theme/import/route.ts`**
  ```typescript
  export async function POST(req: NextRequest, { params }) {
    // Importa tema de JSON
    // Valida estrutura
    // Aplica ao formulário
  }
  ```

- [ ] **Adicionar botões de exportar/importar no editor**

### 4.7. Arquivos Afetados

```
Novos:
- src/lib/theme-templates.ts
- src/lib/google-fonts.ts
- src/lib/theme-dark-mode.ts
- src/lib/background-patterns.ts
- src/components/forms/theme-editor/template-selector.tsx
- src/components/forms/theme-editor/font-selector.tsx
- src/app/api/forms/[id]/theme/export/route.ts
- src/app/api/forms/[id]/theme/import/route.ts
- public/patterns/*.svg

Modificados:
- src/types/form-theme.ts
- src/components/forms/theme-editor/theme-editor.tsx
- src/app/admin/forms/[id]/theme/page.tsx
- src/lib/theme-utils.ts
```

### 4.8. Critérios de Aceitação

✅ **Templates**:
- 5+ templates pré-prontos disponíveis
- Preview funcional de cada template
- Aplicação instantânea

✅ **Google Fonts**:
- Seleção de 20+ fontes populares
- Preview de fontes funcionando
- Fontes carregam corretamente na página pública

✅ **Modo escuro**:
- Toggle funcional
- Cores ajustadas automaticamente
- Contraste adequado mantido

✅ **Patterns**:
- 5+ patterns disponíveis
- Preview funcional
- SVGs otimizados

✅ **Import/Export**:
- Exportar tema como JSON
- Importar tema validado
- Compatibilidade entre formulários

---

# 🎨 FASE 5: Elementos Visuais
**Prioridade**: 🟢 BAIXA | **Duração**: 4-5 dias | **Impacto**: Polimento final

## Objetivos
- ✅ Ícones customizados para tipos de pergunta
- ✅ Animações e transições
- ✅ Progress bar customizável
- ✅ Página de sucesso personalizada

## Checklist de Implementação

### 5.1. Ícones Customizados

- [x] **Criar biblioteca de ícones**
  - Usar Lucide React ou Heroicons
  - Mapear ícones para cada tipo de pergunta
  - Permitir escolher ícone customizado (`form-question-icon-options`, `QuestionLabelIcon`)

- [x] **Adicionar campo no schema**
  ```typescript
  model Question {
    // ... campos existentes
    customIcon String? @map("custom_icon")
  }
  ```

- [x] **Criar seletor de ícones no editor** (`icon-selector.tsx`, edição do formulário admin)

### 5.2. Animações

- [x] **Criar `src/styles/form-animations.css`**
  ```css
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .question-animate {
    animation: fadeIn 0.3s ease-out;
  }
  
  /* ... mais animações */
  ```

- [x] **Adicionar configurações de animação no tema**
  ```typescript
  export interface FormTheme {
    // ... campos existentes
    animations: {
      enabled: boolean;
      style: 'fade' | 'slide' | 'scale' | 'none';
      duration: number;
    };
  }
  ```
  (Implementação: `durationMs` em `FormTheme.animations`; aba Experiência no editor de tema.)

### 5.3. Progress Bar

- [x] **Criar `src/components/forms/progress-bar.tsx`**
  (Reexporta `FormProgressBar` como `ProgressBar`; implementação em `form-progress-bar.tsx`.)
  ```typescript
  export function ProgressBar({
    current,
    total,
    theme
  }: ProgressBarProps) {
    // Barra de progresso visual
    // Usa cores do tema
    // Animação suave
    // Texto "X de Y" ou porcentagem
  }
  ```

- [x] **Adicionar configurações de progress bar**
  ```typescript
  export interface FormTheme {
    // ... campos existentes
    progressBar: {
      enabled: boolean;
      style: 'bar' | 'steps' | 'circular';
      showPercentage: boolean;
      showCount: boolean;
    };
  }
  ```

### 5.4. Página de Sucesso

- [x] **Migration: adicionar campos**
  ```sql
  ALTER TABLE "Form" ADD COLUMN success_page_html TEXT;
  ALTER TABLE "Form" ADD COLUMN success_redirect_url TEXT;
  ALTER TABLE "Form" ADD COLUMN success_redirect_delay INT DEFAULT 0;
  ```
  (Ver `supabase/migrations/015_form_phase5_visuals.sql` e Prisma.)

- [x] **Criar editor de página de sucesso**
  - Rich text editor para conteúdo
  - Opção de redirecionar para URL
  - Delay configurável
  - Preview da página (tema + `FormPreview`)

- [x] **Criar `src/components/forms/success-page.tsx`**
  ```typescript
  export function SuccessPage({
    content,
    redirectUrl,
    redirectDelay
  }: SuccessPageProps) {
    // Página de sucesso customizável
    // Animação de confete opcional
    // Countdown para redirect
  }
  ```
  (Confete não implementado — opcional no roadmap.)

### 5.5. Transições Entre Perguntas

- [x] **Implementar navegação suave**
  - Scroll suave para próxima pergunta (`scroll-smooth` na página de resposta; `scrollIntoView` em erros)
  - Fade in/out entre seções (classes em `form-animations.css` + tema `animations`)
  - Opção de formulário "passo a passo" (wizard por secção: `FormTheme.navigation.mode === "wizard"`)

### 5.6. Arquivos Afetados

```
Novos:
- src/styles/form-animations.css
- src/components/forms/form-progress-bar.tsx
- src/components/forms/progress-bar.tsx (alias ProgressBar)
- src/components/forms/success-page.tsx
- src/components/forms/icon-selector.tsx

Modificados:
- prisma/schema.prisma
- src/types/form-theme.ts
- src/app/forms/[id]/respond/page.tsx
- src/app/admin/forms/[id]/theme/page.tsx
```

### 5.7. Critérios de Aceitação

✅ **Ícones**:
- Ícones para cada tipo de pergunta
- Seletor funcional
- Renderização correta

✅ **Animações**:
- Transições suaves
- Configurável (on/off)
- Performance mantida

✅ **Progress bar**:
- Visível e funcional
- 3+ estilos disponíveis
- Cores do tema aplicadas

✅ **Página de sucesso**:
- Editor funcional
- Redirect opcional
- HTML customizado renderiza corretamente

---

# 🎨 FASE 6: UX e Polimento Final
**Prioridade**: 🟡 MÉDIA | **Duração**: 3-4 dias | **Impacto**: Experiência completa

## Objetivos
- ✅ Preview responsivo (mobile/tablet/desktop)
- ✅ Validação de acessibilidade
- ✅ Performance otimizada
- ✅ Documentação para usuários

## Checklist de Implementação

### 6.1. Preview Responsivo

- [x] **Criar `src/components/forms/responsive-preview.tsx`**
  - Abas Telemóvel / Tablet / Desktop com larguras máximas configuráveis; `touch-manipulation` na área de preview (sem iframe — layout por largura).

- [x] **Adicionar breakpoints no tema**
  - `FormTheme.responsive: { mobileBreakpoint, tabletBreakpoint }` (predefinição 390 / 834 px), editáveis na aba Experiência.

### 6.2. Validador de Acessibilidade

- [x] **Criar `src/lib/accessibility-validator.ts`**
  - Contraste (texto, links, botão primário), tamanho base, heurísticas de densidade e borda de input; testes em `accessibility-validator.test.ts`.

- [x] **Adicionar badge de acessibilidade no editor**
  - `ThemeAccessibilityBadge` junto ao título «Editor»; estados verde / âmbar / vermelho; `title` com lista de pontos.

### 6.3. Otimização de Performance

- [x] **Lazy loading de componentes pesados**
  - Secções do editor carregadas com `next/dynamic` (cores, tipografia, layout, componentes, imagens, textos).

- [x] **Otimização de imagens**
  - `compress-image-file.ts`: redimensiona aresta máx. 1920 px, exporta WebP ou JPEG antes do upload de branding.

- [x] **Debounce de atualizações**
  - `useDebouncedValue(theme, 300)` na página de tema para a pré-visualização.

### 6.4. Documentação

- [x] **Criar `docs/THEME_GUIDE.md`**
  - Uso do editor, boas práticas, exportações JSON/PNG.

- [x] **Criar tooltips no editor**
  - Atributo `title` em cada aba do `ThemeEditor` com descrição curta.

- [x] **Criar tour guiado**
  - `ThemeEditorTour` + `localStorage` (`consultech_theme_editor_tour_v1`).

### 6.5. Exportar Imagem do Formulário

- [x] **Criar endpoint de screenshot**
  - `GET /api/forms/[id]/screenshot` (autenticado): JSON com instruções; PNG gerado no cliente com `html-to-image` (sem Puppeteer).

- [x] **Adicionar botão "Exportar imagem" no editor**

### 6.6. Testes E2E

- [x] **Criar testes Playwright/Cypress**
  - Playwright + `playwright.config.ts` (servidor `npm run dev`); `tests/e2e/app-smoke.spec.ts` (smoke na home). Fluxo completo formulário+tema fica para extensão futura.

### 6.7. Arquivos Afetados

```
Novos:
- src/components/forms/responsive-preview.tsx
- src/lib/accessibility-validator.ts
- src/lib/accessibility-validator.test.ts
- src/hooks/use-debounced-value.ts
- src/lib/compress-image-file.ts
- src/lib/export-form-preview-png.ts
- src/components/forms/theme-editor/theme-accessibility-badge.tsx
- src/components/forms/theme-editor/theme-editor-tour.tsx
- src/app/api/forms/[id]/screenshot/route.ts
- docs/THEME_GUIDE.md
- playwright.config.ts
- tests/e2e/app-smoke.spec.ts

Modificados:
- src/types/form-theme.ts, form-theme-defaults.ts, form-theme.schema.ts
- src/app/admin/forms/[id]/theme/page.tsx
- src/components/forms/theme-editor/theme-editor.tsx
- src/components/forms/theme-editor/theme-experience-section.tsx
- src/components/forms/theme-editor/form-preview.tsx
- package.json (html-to-image, script test:e2e)
```

### 6.8. Critérios de Aceitação

✅ **Preview responsivo**:
- Tabs funcionais (desktop/tablet/mobile)
- Larguras alinhadas aos breakpoints do tema
- Pré-visualização com debounce (menos trabalho por tecla)

✅ **Acessibilidade**:
- Validador funcional
- Badge visível
- Tema predefinido sem issues críticas; temas personalizados podem gerar avisos ou falhas até o criador ajustar cores

✅ **Performance**:
- Secções pesadas do editor em carregamento preguiçoso
- Debounce 300 ms na pré-visualização
- Compressão de imagens no upload de branding

✅ **Documentação**:
- Guia em `docs/THEME_GUIDE.md`
- Tooltips nas abas do editor
- Tour na primeira visita ao editor de tema

---

# 📎 FASE 7: Ficheiros, anexos e recursos estáticos no formulário
**Prioridade**: 🔴 ALTA | **Duração**: 6-9 dias | **Impacto**: Pedidos explícitos de “colocar ficheiro no form” + conformidade

## Objetivos
- ✅ Permitir **ficheiros de referência** visíveis no formulário (PDF, imagem) — download ou visualização embutida
- ✅ Permitir **perguntas de upload** (respondente envia um ou vários ficheiros)
- ✅ **Quotas**, validação de tipo MIME, tamanho máximo, e política de retenção
- ✅ Integração com storage (ex.: Supabase Storage) + URLs assinadas quando necessário
- ✅ **LGPD / privacidade**: consentimento, aviso de tratamento, prazo de eliminação

## User Stories
1. **Como criador**, quero anexar um PDF de instruções ao formulário, para o respondente ler antes de responder
2. **Como criador**, quero uma pergunta “envie o seu comprovativo”, com limite de 5 MB e só PDF/JPG
3. **Como respondente**, quero ver claramente o que estou a enviar e poder remover o ficheiro antes de submeter
4. **Como administrador**, quero definir políticas globais de upload (tipos e tamanhos) por ambiente

## Checklist de Implementação

### 7.1. Database & Schema
- [x] **Migration: `016_form_attachments.sql`**
  - Tabela `form_static_asset` (form_id, storage_path, public_url, mime_type, label, display_order) **ou** JSON em `Form` se volume for baixo
  - Tabela `response_attachment` (response_id, question_id, storage_path, mime_type, size_bytes, original_filename, virus_scan_status)
  - Índices por `form_id`, `response_id`

- [x] **Atualizar `prisma/schema.prisma`** com modelos e relações

### 7.2. Storage e API
- [ ] **Buckets** (ex.: `form-assets`, `response-uploads`) com políticas RLS / regras de acesso — configurar no Supabase (projeto usa bucket `form-assets` no código)
- [x] **`POST /api/forms/[id]/assets`** — upload de recurso estático do form (autenticado admin)
- [x] **`POST /api/responses/submit` ou rota dedicada** — multipart upload ou URL pré-assinada + finalize (`POST /api/forms/[id]/response-file` + metadados em `submit`)
- [ ] **Antivírus / scanning** (opcional: integração assíncrona; fila + estado `pending|clean|rejected`)
- [x] **Limites** configuráveis via env: `MAX_UPLOAD_BYTES`, `ALLOWED_MIME_LIST`

### 7.3. Frontend — Editor
- [x] Tipo de pergunta **File upload** com UI de regras (extensões, tamanho, obrigatório, multi-ficheiro)
- [x] Bloco **File download / viewer** (ligado à Fase 2: `file_download`) com preview de PDF onde o browser suportar

### 7.4. Frontend — Resposta pública
- [x] Componente de dropzone acessível (teclado + leitor de ecrã)
- [x] Lista de ficheiros escolhidos com remover antes de enviar
- [x] Barra de progresso de upload
- [x] Mensagens de erro claras (tipo não permitido, ficheiro demasiado grande)

### 7.5. Segurança e conformidade
- [x] Sanitizar nomes de ficheiro; nunca executar uploads como scripts
- [x] **Content-Type** validado server-side (magic bytes quando possível)
- [ ] Política de retenção e job de limpeza para anexos órfãos / após prazo (não automatizado; pode ser processo operacional ou fase futura)
- [x] Registo em audit log de uploads administrativos

### 7.6. Critérios de aceitação
- Upload e download funcionais em desktop e mobile
- Limites aplicados no cliente **e** no servidor
- Respostas exportáveis com referência ou URL assinada aos anexos (definir política) — export JSON inclui `attachments`; CSV/XLSX mantém valores de resposta (URLs nas células quando guardados nas respostas)

---

# 🧭 FASE 8: Identificação do respondente, links e experiência por passos (UX de resposta)
**Prioridade**: 🔴 ALTA | **Duração**: 8-12 dias | **Impacto**: Endereça reclamações sobre obrigatoriedade de dados, falta de links e formulário “tudo numa página”

## Objetivos
- ✅ Tornar **explícita e configurável** a recolha de identificação (matrícula, e-mail, nome) vs **respostas anónimas** (quando o modelo de dados e a política o permitirem).
- ✅ Permitir **hiperligações** em textos do formulário (descrições, ajuda, blocos) de forma segura (sanitização, `rel`, abrir em nova aba quando fizer sentido).
- ✅ Oferecer **modo de resposta em passos** (estilo Google Forms: secção a secção ou pergunta a pergunta), com **progresso** e navegação Anterior/Seguinte, em alternativa à **página única** atual.
- ✅ Garantir que **secções** tenham valor percebido: no modo por passos, cada passo corresponde a uma secção (ou grupo definido no editor).

## Problema de produto (resumo)
- Hoje o respondente pode sentir que **tem de** identificar-se sem encontrar opção “anónimo”.
- Textos **sem links** clicáveis reduzem utilidade de instruções longas.
- **Lista contínua** de perguntas faz parecer “rascunho” e anula o efeito psicológico das secções; utilizadores esperam **fluxo guiado** opcional.

## User Stories
1. **Como criador**, quero definir se o formulário exige identificação (e-mail/matrícula), se é opcional, ou se as respostas são anónimas, para estar alinhado com RGPD e com a minha pesquisa.
2. **Como respondente**, quero ler na página se a minha resposta é anónima ou o que será guardado sobre mim.
3. **Como criador**, quero colocar **links** nas descrições e textos de ajuda, para apontar para regulamentos ou páginas externas.
4. **Como respondente**, quero avançar **secção a secção** (ou pergunta a pergunta) com botões claros, para não ver um formulário infinito de uma só vez.
5. **Como criador**, quero escolher o **modo de apresentação**: página única vs assistente por passos, e pré-visualizar o mesmo fluxo que o link público.

## Checklist de Implementação

### 8.1. Database & Schema (Form / Response)
- [x] **Migration** (`017_form_response_settings.sql`)
  - No `Form` (JSON `response_settings`): campos:
    - `respondentIdentificationMode`: `'required' | 'optional' | 'anonymous'`
    - `responseLayoutMode`: `'single_page' | 'wizard_by_section' | 'wizard_by_question'`
    - `showProgressBar`: boolean
    - `allowSaveDraft`: boolean
  - Modelo `Response` com `respondent_id` opcional e `submission_metadata` (JSON) para modo de identificação na submissão.

### 8.2. Backend
- [x] **`GET /api/forms/by-slug/...` e rotas públicas**: `responseSettings` (inclui modos de identificação e layout) exposto ao cliente público.
- [x] **`POST /api/responses/submit`**:
  - Se `anonymous`: não exige identificação; rejeita dados de respondente no body.
  - Se `required`: valida presença dos campos exigidos.
  - Se `optional`: aceita com ou sem identificação.
- [x] **Metadado de submissão**: `submissionMetadata.respondentIdentificationMode` persistido em `responses` (relatórios/export).

### 8.3. Admin — Editor do formulário
- [x] Secção **“Identificação do respondente”** (obrigatório / opcional / anónimo) + `allowAnonymous` derivado.
- [x] Secção **“Como o formulário é mostrado”**: página única, um passo por secção, um passo por pergunta; progresso e rascunho configuráveis.
- [x] Link para **pré-visualização pública** (`/forms/[id]/respond`).

### 8.4. Página pública de resposta (`/forms/.../respond` ou equivalente)
- [x] Bloco de identificação ou mensagem anónima conforme modo.
- [x] **Wizard**: passo atual; Anterior / Seguinte / Enviar; barra de progresso opcional; scroll ao mudar de passo.
- [x] **Modo página única**: compatível com o existente.
- [ ] **Nice-to-have**: âncoras por secção / sumário colapsável na página única.

### 8.5. Links em textos
- [x] Markdown limitado + sanitização em descrições de secção, ajuda e componentes partilhados (`safe-formatted-text`, etc.).
- [ ] Alternativa estruturada “URL + rótulo” (não necessária se Markdown limitado cobre o caso).

### 8.6. Testes e critérios de aceitação
- [x] Fluxo anónimo e obrigatório cobertos em testes de `submit-response`.
- [x] Estado de wizard e rascunho na UI pública (`respond-form-view`).
- [ ] Validação automática “admin vs incógnito — mesma UI” (verificação manual recomendada).

### 8.7. Arquivos prováveis (orientação)
```
Novos / a alterar (ajustar a estrutura real do repo):
- prisma/schema.prisma (+ migration)
- src/app/api/forms/...
- src/app/api/responses/submit/... ou rota existente
- src/app/forms/.../respond/page.tsx (ou componentes extraídos)
- src/components/forms/wizard/... (container de passos)
- src/lib/sanitize-markdown.ts ou similar
- src/app/admin/forms/[id]/edit/... (painel de definições)
```

### 8.8. Dependências com outras fases
- **Fase 1**: descrições de secção visíveis no topo de cada passo no modo wizard.
- **Fase 2**: blocos ricos reforçam links e conteúdo entre perguntas.
- **Fase 6**: preview responsivo e documentação “o que o respondente vê”.

---

# 📑 FASE 9: Visualização de respostas, filtros por área e secções condicionais
**Prioridade**: 🔴 ALTA | **Duração**: 8-12 dias | **Impacto**: Análise utilizável — “por membro”, “por pergunta”, por equipa, e audiências por secção

## Objetivos
- ✅ **Vistas múltiplas** na área de respostas: (A) lista de respondentes / submissões com drill-down; (B) **vista por pergunta** (coluna de respostas agregadas ou lista de valores, estilo Google Forms).
- ✅ **Filtros** por atributo do membro (área, departamento, papel) quando os dados existirem no `Respondent` ou forem recolhidos no formulário.
- ✅ **Secções condicionais** (audiência): mostrar ou saltar blocos de perguntas com base em regras (ex.: “só GP”, “só para quem respondeu X na pergunta Y”).
- ✅ A partir de uma resposta individual, **saltar para a secção** correspondente ou destacar perguntas agrupadas por secção (navegação lateral ou âncoras).

## User Stories
1. **Como analista**, quero ver uma **lista de nomes** e ao clicar ver **todas as respostas dessa pessoa** numa única página legível.
2. **Como analista**, quero escolher **uma pergunta** e ver **todas as respostas** só dessa pergunta, para comparar opiniões.
3. **Como guardião de área**, quero filtrar respostas **só do Marketing** (ou Comercial), para acompanhar o meu grupo.
4. **Como criador**, quero configurar que **certa secção só aparece** para perfis específicos (ex.: GP avalia projetistas), para pesquisas de desempenho segmentadas.

## Checklist de Implementação

### 9.1. UI — Vistas de resposta
- [x] **Tabs** na página de respostas: `Por submissão` | `Por pergunta` | `Tabela`.
- [x] **Vista “Por submissão”**: lista (nome, data, departamento do perfil); detalhe com respostas por **secção** (marcadores `section`).
- [x] **Vista “Por pergunta”**: seletor → distribuição (contagens / média / amostras de texto).
- [x] Exportação CSV/Excel/JSON mantida no topo da página (Fase 11 pode aprofundar).

### 9.2. Filtros (área / equipa)
- [x] Departamento via campo `Respondent.department` + texto explicativo para filtrar por pergunta (busca no conteúdo).
- [x] **Filtros combinados** (departamento + datas + respondente + texto nas respostas).
- [x] **URL** sincronizada (`startDate`, `endDate`, `respondentSearch`, `answerSearch`, `department`, `view`, `response`).

### 9.3. Secções condicionais (motor de regras)
- [x] JSON `section_visibility_rules` no `Form`: `sectionTitle` + condição (`respondent_department` ou `answer` com eq/neq/in).
- [x] Avaliação no **respond** (`filterVisibleResponseQuestions`) e **validação no submit** (`assertAnswersRespectVisibility`).
- [x] Editor no admin (lista de regras, sem código).

### 9.4. Navegação “abrir secção a partir da resposta”
- [x] Sumário de secções com **âncoras** `#sec-N` no detalhe da submissão.
- [ ] Deep link dedicado `.../responses?response=id` (parcial: query `response=` na URL).

### 9.5. APIs
- [x] `GET /api/forms/[id]/responses/aggregate` (sessão admin) com os mesmos filtros que a listagem.
- [ ] Mascaramento RGPD adicional (não implementado; export e insights já têm práticas de redução de dados).

### 9.6. Critérios de aceitação
- [x] Três vistas na UI admin; testes de visibilidade e agregação.
- [x] Filtro por departamento quando o respondente tem perfil; copy quando não há dado além da busca em respostas.
- [x] Submissão rejeitada se incluir respostas a perguntas não visíveis.

---

# 📂 FASE 10: Pastas navegáveis (estilo Drive) e biblioteca de templates
**Prioridade**: 🟡 MÉDIA | **Duração**: 5-7 dias | **Impacto**: Organização e descoberta de modelos

## Objetivos
- ✅ Navegação de **pastas** com **clique para entrar**, breadcrumb e lista de itens dentro da pasta (não apenas título decorativo).
- ✅ Espaço dedicado **“Templates”** (biblioteca), com cartões, pré-visualização e ação **Usar modelo** visível no contexto certo.
- ✅ Paridade de expectativa com ferramentas tipo Pipe/Drive: hierarquia clara.

## User Stories
1. **Como utilizador**, quero **clicar numa pasta** e ver só os formulários dessa pasta, com caminho no topo.
2. **Como utilizador**, quero uma **área só de templates** para não misturar com formulários “ao vivo”.
3. **Como criador**, quero **duplicar a partir de um template** em dois cliques a partir da biblioteca.

## Checklist de Implementação

### 10.1. Navegação e rotas
- [ ] Rotas tipo `/admin/forms/folders/[folderId]` ou query `?folder=` com **transição** de lista ao clicar na pasta.
- [ ] **Breadcrumb**: Raiz > Pasta A > Subpasta B.
- [ ] Ícones de pasta **clicáveis**; estado de hover/focus acessível.

### 10.2. Templates
- [ ] Coleção ou flag `isTemplate` + **coleção visual** “Biblioteca de templates” (página ou separador).
- [ ] Cartão com título, descrição curta, botão **Usar modelo** (cria form novo a partir do blueprint).
- [ ] (Opcional) **Categorias** de template (Onboarding, Pesquisa, RH).

### 10.3. Critérios de aceitação
- [ ] Comportamento percebido como “entrar na pasta”, não só label.
- [ ] Templates encontráveis sem procurar apenas pelo texto “usar modelo” na lateral.

---

# 📊 FASE 11: Dashboards com gráficos e tabelas a partir das respostas + exportação
**Prioridade**: 🔴 ALTA | **Duração**: 8-11 dias | **Impacto**: Crítica principal — dados analíticos úteis, não só taxas de preenchimento

## Objetivos
- ✅ Para cada dashboard ligado a formulários, mostrar **visualizações derivadas das respostas** (gráficos de barras, pizza, distribuição de escalas, tabelas de texto agregado ou amostra).
- ✅ **Exportação** para Excel/CSV com as respostas tabulares (perguntas em colunas).
- ✅ **Configurabilidade** das métricas: esconder ou desvalorizar **abandono por pergunta** quando **todas as perguntas são obrigatórias** (métrica pouco informativa); destacar **distribuição de respostas** e **correlações simples**.
- ✅ Alinhar com **gráficos customizados** já previstos no produto (`dashboard_chart` / APIs de charts) — evitar duplicar lógica; documentar o fluxo no tutorial.

## Problema de produto (resumo)
- Hoje o utilizador vê sobretudo **percentagem de resposta por pergunta**, **tempo**, **conclusão**, **abandono** — pouco útil quando o form é curto e tudo obrigatório.
- Falta **leitura do conteúdo** das respostas (escalas, MCQ, texto) em formato gráfico ou tabela.

## User Stories
1. **Como analista**, quero **gráficos** que mostrem a distribuição das opções de uma pergunta de escala ou escolha múltipla.
2. **Como analista**, quero uma **tabela** com uma linha por resposta e colunas por pergunta, exportável para Excel.
3. **Como gestor**, quero **desligar ou minimizar** o bloco de abandono por pergunta quando não faz sentido para o meu processo.
4. **Como novo utilizador**, quero o **tutorial** a refletir as capacidades reais após esta fase.

## Checklist de Implementação

### 11.1. Camada de agregação
- [x] Serviço de domínio: por `formId` + intervalo de datas, calcular **distribuições** por `questionId` e tipo (numérico, opção, texto).
- [x] Tratamento de **múltipla escolha** e **matriz** (se existirem) com regras explícitas.

### 11.2. UI do dashboard
- [x] **Widget** por pergunta: tipo automático (bar chart / pie / lista) conforme `question.type`.
- [x] **Modo tabela**: visão “planilha” só leitura no browser + botão **Exportar**.
- [x] **Ligação** aos gráficos configuráveis pelo utilizador (Fase roadmap de dashboards) — mesma fonte de dados.

### 11.3. Métricas de processo vs métricas de conteúdo
- [x] Secção **“Fluxo de preenchimento”** (tempo, conclusão, abandono) **colapsável** ou oculta por defeito quando `allQuestionsRequired`.
- [x] Secção **“Conteúdo das respostas”** em destaque por defeito após implementação.

### 11.4. Exportação
- [x] Export XLSX/CSV com cabeçalhos = texto da pergunta; linhas = submissões; células = valor normalizado.
- [x] Limite de linhas e aviso para formulários muito grandes (performance).

### 11.5. Tutorial e empty states
- [x] Atualizar fluxo do tutorial e **capturas** quando houver gráficos reais.
- [x] Empty state: “Ainda não há respostas suficientes para gráfico” vs “Configure o tipo de pergunta para ver distribuição”.

### 11.6. Critérios de aceitação
- [x] Com pelo menos 2 respostas de teste, o dashboard mostra **pelo menos um gráfico ou tabela** baseado em **valores** das perguntas, não só percentagens de preenchimento.
- [x] Exportação abre corretamente no Excel/LibreOffice.
- [x] Abandono por pergunta não domina o ecrã quando configurado como pouco relevante.

---

# 📊 Resumo Executivo

## Impacto por Fase

| Fase | Resolve Crítica | Tempo | ROI |
|------|----------------|-------|-----|
| Fase 1 | ✅✅✅ Descrições ausentes | 3-5 dias | 🟢 Alto |
| Fase 2 | ✅✅ Conteúdo rico + blocos ficheiro | 5-7 dias | 🟢 Alto |
| Fase 3 | ✅✅✅✅ Personalização visual + **largura %** + tokens | 8-12 dias | 🟢 Muito Alto |
| Fase 4 | ✅ Diferenciação | 7-10 dias | 🟡 Médio |
| Fase 5 | ✅ Polimento | 4-5 dias | 🟡 Médio |
| Fase 6 | ✅ Experiência | 3-4 dias | 🟢 Alto |
| Fase 7 | ✅✅ Ficheiros / anexos / PDFs no form | 6-9 dias | 🟢 Muito Alto |
| Fase 8 | ✅✅✅ Anónimo/opcional, **links**, **wizard por secções** | 8-12 dias | 🟢 Muito Alto |
| Fase 9 | ✅✅✅ Vistas de resposta, filtros, **secções condicionais** | 8-12 dias | 🟢 Muito Alto |
| Fase 10 | ✅✅ Pastas tipo Drive + **biblioteca de templates** | 5-7 dias | 🟢 Alto |
| Fase 11 | ✅✅✅ Gráficos/tabelas das respostas, export, métricas úteis | 8-11 dias | 🟢 Muito Alto |

## Ordem de Prioridade Recomendada

1. **FASE 1** - Impacto imediato, baixa complexidade
2. **FASE 11** - **Dashboards com dados reais** (queixa forte) — pode subir se a análise for prioridade máxima
3. **FASE 9** - **Visualização de respostas** e filtros (paralelo ou logo a seguir à 11)
4. **FASE 8** - **Reclamações de fluxo** (identificação, links, passos) — forte impacto em UX sem depender de tema
5. **FASE 3** - Personalização visual + **canvas (% largura)** + tipografia e componentes
6. **FASE 7** - Upload e ficheiros no form (depende de storage e segurança)
7. **FASE 2** - Blocos ricos + `file_download` alinhado com Fase 7; reforça **links** com Fase 8
8. **FASE 10** - Pastas e templates (organização)
9. **FASE 4** - Recursos avançados para power users
10. **FASE 6** - UX e qualidade (preview = link público; **tutorial** alinhado à Fase 11)
11. **FASE 5** - Elementos visuais finais

## Métricas de Sucesso

### Após Fase 1
- ✅ 0 reclamações sobre falta de contexto
- ✅ Taxa de abandono reduzida em 20%
- ✅ Respostas mais completas e precisas

### Após Fase 3
- ✅ 0 reclamações sobre "falta de personalidade"
- ✅ Formulários com identidade visual da marca
- ✅ Controlo explícito da **largura do form em %** e alinhamento
- ✅ Aumento de 30% no engajamento (meta)

### Após Fase 7
- ✅ Formulários com PDFs/recursos e **upload** pelo respondente quando necessário
- ✅ Zero incidentes de MIME/tamanho não validados no servidor

### Após Fase 8
- ✅ Configuração clara de **resposta anónima / opcional / obrigatória** sem ambiguidade para o criador e para o respondente
- ✅ **Links** utilizáveis em textos de apoio e descrições
- ✅ Opção de **assistir por secções** (ou por pergunta), com progresso — formulários longos deixam de parecer “um bloco só”

### Após Fase 9
- ✅ **Duas vistas principais** de análise: por pessoa e por pergunta; filtros por área/equipa quando aplicável
- ✅ **Secções condicionais** permitem fluxos tipo “só GP” ou avaliação segmentada

### Após Fase 10
- ✅ **Pastas navegáveis** (entrar/sair) e **biblioteca de templates** visível e utilizável

### Após Fase 11
- ✅ Dashboard mostra **gráficos e/ou tabelas** alimentados pelas **respostas**, não só métricas de preenchimento
- ✅ **Exportação** tabular (Excel/CSV) para análise externa
- ✅ Tutorial e empty states **alinhados** às capacidades reais

### Após Fase 6
- ✅ Sistema completo e profissional
- ✅ Diferenciação competitiva estabelecida
- ✅ Satisfação do usuário >90%

---

## 🚀 Próximos Passos Imediatos

Para começar a implementação:

1. **Revisar e aprovar este roadmap**
2. **Priorizar as fases** (sugestão: 1 → **11** + **9** em paralelo conforme equipa → **8** → 3 → 7 → 2 → **10** → 6 → 4 → 5)
3. **Alocar recursos** (desenvolvedores, designers, QA)
4. **Configurar tracking de progresso** (GitHub Projects, Jira, etc.)
5. **Começar pela Fase 1** (menor risco, maior impacto imediato)
6. **Planejar Fase 7 em paralelo** com decisões de storage, limites e conformidade (upload é transversal)
7. **Alinhar Fase 11** com APIs/charts de dashboard já existentes no projeto para não duplicar agregações

**Quer que eu comece a implementar a Fase 1 agora?** 🚀
