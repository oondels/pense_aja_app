# Frontend Architecture

## Overview

O frontend é uma SPA em Vue 3 com Vite. A aplicação combina:

- Vue Router para navegação
- Pinia para estado simples de usuário
- Vuetify para parte dos componentes UI
- Tailwind utilities e CSS manual para layout e visual
- Axios para integração com autenticação e API de negócio
- PWA support com `virtual:pwa-register`

## Entry Points

- `cliente/src/main.js`: cria a app, registra Pinia, router, Vuetify, VueRewards, VueLazyload e o registro do service worker.
- `cliente/src/App.vue`: monta `Navbar`, `GetUserEmail`, `GetUserOffice`, `router-view`, `Footer` e o toggle de manutenção.

## State Model

### Browser storage

- `sessionStorage` guarda contexto de login:
  - `matricula`
  - `usuario`
  - `nome`
  - `funcao`
  - `gerente`
  - `setor`
  - `haveEmail`
  - `expirationTime`
- `localStorage` guarda contexto mais durável:
  - `unidadeDass`
  - `unitConfig:<unidadeDass>` com configuração efetiva da unidade
  - `hasSeenNews`
  - `emailProvided`
  - `emailSkipUntil`

### Pinia

`userStore` hidrata o usuário a partir do `sessionStorage` e carrega o contexto de sessão por unidade, incluindo permissões e `unitConfig`.

## API Layer

Há três clientes Axios:

- `authApi`: serviço externo de autenticação em `${VITE_API_URL}:2399`
- `api`: backend autenticado em `${VITE_API_URL}:2512`
- `commonApi`: backend sem interceptor de refresh

O interceptor:

- tenta refresh proativo antes de requests autenticadas
- ao receber `401`, tenta `POST /auth/token/refresh`
- repete a request original após refresh bem-sucedido
- limpa a sessão e recarrega a página se refresh também falhar com `401` ou `403`

## UI Composition

### Layout global

- `Navbar` é o hub de ações principais
- desktop expõe loja, cadastro e login
- mobile usa `v-bottom-navigation`

### Views

- `Home.vue`: landing institucional
- `PenseAja.vue`: lista principal de ideias
- `ItemPenseAja.vue`: detalhe e avaliação
- `Dashboard.vue`: analytics e exportação
- `UserPage.vue`: perfil e preferências
- `News.vue`: tela de novidades e rollout

### Reuso por composables

O dashboard usa composables para:

- summary
- monthly
- dimensional
- ideas
- engagement

Todos têm padrão similar:

- `isLoading`
- `error`
- `refetch`
- fallback local em caso de erro

## Architectural Characteristics

- a maior parte das regras de negócio fica nos services e em alguns componentes grandes
- há forte dependência de browser storage para estado
- o frontend mistura componentes muito enxutos com componentes bem grandes, como `RegisterPenseAja.vue`, `ListaPenseAja.vue` e `ItemPenseAja.vue`
- parte da UX depende de reload total da página após certas ações, em vez de atualização reativa local

## Current Risks

- há dependência de múltiplos serviços externos e portas fixas
- o status de ideias é derivado no frontend por lógica própria em vários pontos
- parte da navegação depende de side effects em `localStorage`
- há funcionalidades presentes no código, mas parcialmente desabilitadas na UI, como IA de melhoria de texto
