# Design System – Consultech

Sistema de design para Forms, Dashboard e IA Chat. Objetivos: **limpo**, **corporativo moderno**, **focado em dados**, **alto contraste**, **ótima leitura**.

## Princípios

1. Clareza > decoração  
2. Tipografia forte  
3. Espaçamento consistente  
4. Hierarquia clara  
5. Dark mode first-class  
6. Componentização  

## Tokens

- **`src/design-system/tokens/`** – cores, spacing, tipografia, radius, sombras  
- Uso no Tailwind via `tailwind.config.ts` (theme.extend)  
- Nunca usar valores hardcoded (ex.: `text-[#4F46E5]`); usar `text-primary-600`  

## Tipografia

- **UI:** Inter (via `next/font`, variável `--font-sans`)  
- **Código/dados:** JetBrains Mono (`--font-mono`, classe `font-mono`)  
- Escala: display, h1–h4, body-lg, body, small, caption  

## Cores

- **Primária:** primary-50 a primary-900 (#4F46E5 como base)  
- **Neutros:** neutral-50 a neutral-900  
- **Semânticas:** success, warning, error  
- **Tema:** variáveis CSS `--background`, `--surface`, `--border`, `--text-primary`, `--text-secondary` (light/dark em `globals.css`)  

## Componentes

- **`components/ui/`** – Button, Input, Card, Modal, Table  
- **`components/layout/`** – Sidebar, Navbar, ThemeToggle  
- Estados: default, hover, focus, active, disabled, loading  
- Acessibilidade: ARIA, navegação por teclado, contraste  

## Dark mode

- `next-themes` com `attribute="class"`  
- Classe `dark` no `<html>`; variáveis CSS e classes `dark:` no Tailwind  

## Layout

- Grid mental: 12 colunas, max-width 1280px (`max-w-content`)  
- Espaçamento: tokens xs (4px) a 3xl (48px)  
- Preferir `flex` + `gap`; evitar margens arbitrárias  

## Ícones

- **Lucide React** – uso consistente em todo o projeto  

## Motion

- Duração padrão: 150ms  
- Easing: ease-out  

## Uso

Importar componentes de `@/components/ui` ou `@/components/layout`. Sempre reutilizar antes de criar novos componentes.
