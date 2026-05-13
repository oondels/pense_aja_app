# AGENTS.md - Pense Aja

Voce e um agente de desenvolvimento para o projeto Pense Aja, responsavel por garantir qualidade, seguranca, consistencia e baixo acoplamento entre frontend, backend e documentacao. Este documento define as regras, padroes e protocolos que devem ser seguidos para manter a integridade do repositorio.

O aplicativo Pense Aja é uma plataforma de inovacao aberta que conecta ideias, pessoas e recursos para transformar criatividade em acao. O sistema inclui um frontend Vue 3 para cadastro, listagem, avaliacao, dashboard, perfil, notificacoes e PWA; um backend Express com TypeScript para API de ideias, usuarios, dashboard, loja, notificacoes e IA; e uma documentacao detalhada em `specs/` para navegacao rapida e manutencao segura.

O aplicativo trata-se de uma plataforma de gamificação de ideias, onde usuarios podem submeter ideias, avaliar outras ideias, ganhar pontos, resgatar recompensas e acompanhar seu progresso em um dashboard. O backend inclui regras de negocio para avaliacao, pontuacao, notificacao e loja, enquanto o frontend implementa a interface de usuario e a experiencia de interacao. A documentacao em `specs/` serve como fonte primaria de contexto e referencia para qualquer trabalho no repositorio.

## Regras do Aplicativo Pense Aja
1. Usuarios comuns conseguem cadastrar ideias de pense e aja
2. Usuarios com o papel de `analista` e `gerente` conseguem avaliar ideias, atribuir pontuacao e deixar feedback.
3. Usuarios acumulam pontos com base na avaliacao de suas ideias e podem resgatar recompensas na loja.
4. O dashboard do usuario exibe seu progresso, pontuacao, avaliacoes recebidas e recompensas resgatadas.
5. O sistema envia notificacoes para usuarios quando suas ideias sao avaliadas, quando ganham pontos ou quando resgatam recompensas.

## Regras de Operacao

1. Descubra em qual area do repositorio voce vai atuar antes de alterar qualquer arquivo. Se o escopo nao estiver claro, pergunte.
2. As areas principais deste repositorio sao:
 - `cliente` (frontend Web/PWA)
 - `server` (backend API)
 - `specs` (documentacao tecnica e lookup para code agents)
3. Leia primeiro a documentacao da area afetada antes de implementar:
 - frontend: `specs/frontend/README.md`
 - backend: `specs/backend/README.md`
 - visao de alto nivel: `specs/DESIGN_SPEC.md`
4. Para qualquer funcionalidade, task, bugfix ou refactor, use as specs da area correspondente como fonte primaria de navegacao e contexto antes de abrir muitos arquivos de codigo.

## 0) Ordem de Precedencia

1. Hard Rules (secao 1)
2. `specs/frontend/README.md` e arquivos relacionados, para tarefas de frontend
3. `specs/backend/README.md` e arquivos relacionados, para tarefas de backend
4. `specs/DESIGN_SPEC.md`
5. `cliente/README.md`
6. Este `AGENTS.md`
7. Preferencias locais de implementacao presentes no codigo ja existente

## 1) Hard Rules (Inviolaveis)

- HR-001: Toda alteracao deve respeitar a separacao entre `cliente`, `server` e `specs`; nao mova logica entre camadas sem necessidade clara.
- HR-002: Se a tarefa for de frontend, consulte `specs/frontend/*` antes de decidir rotas, estado, integracoes ou regras de UI.
- HR-003: Se a tarefa for de backend, consulte `specs/backend/*` antes de alterar rotas, regras de negocio, auth, notificacoes, dashboard ou integracoes.
- HR-004: Nao hardcode segredos, tokens, credenciais, hosts sensiveis ou chaves de API em codigo versionado.
- HR-005: Nao altere contrato de rota, payload ou regra de status sem refletir a mudanca nas specs correspondentes.
- HR-006: Nao comite `.env`, credenciais, artefatos grandes ou dados sensiveis.
- HR-007: Rotas protegidas no backend devem continuar exigindo token valido quando o fluxo atual usa `verifyToken`.
- HR-008: O frontend nao deve expor token, segredo, payload sensivel ou PII em logs do browser.
- HR-009: Antes de concluir trabalho que muda comportamento, atualize a documentacao relevante em `specs/`.

## 2) Arquitetura

- Repositorio com tres areas principais:
  - `cliente`: frontend Vue 3 + Vite para cadastro, listagem, avaliacao, dashboard, perfil, notificacoes e PWA.
  - `server`: API Express + TypeScript para ideias, usuarios, dashboard, loja, notificacoes e IA.
  - `specs`: documentacao detalhada do sistema para navegacao rapida e manutencao segura.
- Frontend: Vue 3 + Vite + Pinia + Vue Router + Vuetify + Tailwind + Axios + Chart.js.
- Backend: Express + TypeScript + PostgreSQL + Redis + RabbitMQ + Gemini API.
- Sessao baseada em cookie com `withCredentials`; refresh de token e feito por servico externo de autenticacao.
- Unidade Dass (`unidadeDass`) e parte central do escopo funcional no frontend e backend para delegação da unidade operacional do sistema.
- Estados de Pense Aja, avaliacao, pontuacao, notificacao e resgate dependem de regras explicitas ja documentadas em `specs/backend`.

## 3) Coding Standards

### Backend (`server`)

- Manter separacao por `routes`, `services`, `middlewares`, `config`, `types`, `utils`, `workers`.
- Usar `async/await`; evitar encadeamento `.then()` em novos codigos.
- Services devem encapsular regra de negocio e transacoes quando houver escrita em mais de uma entidade.
- Validacoes de unidade, status, email, datas e permissao devem permanecer no backend, mesmo se houver validacao no frontend.
- Usar `CustomError` para erros de dominio/fluxo e manter mensagens coerentes com o padrao atual.
- Nao hardcode de segredos ou parametros sensiveis; usar `server/src/config/dotenv.ts`.

### Frontend (`cliente`)

- Preferir Vue SFC com Composition API e manter a consistencia com o estilo ja existente do arquivo.
- Estado global simples deve ficar em Pinia; regras locais podem ficar no componente quando ja seguem esse padrao no modulo.
- Integracao HTTP deve usar `authApi`, `api` ou `commonApi` de `cliente/src/services/httpClient.js`.
- Componentes de pagina devem permanecer enxutos quando possivel; logica de API e mapeamento devem ficar em `services/` ou `composables/`.
- Nao expor segredos, cookies, email completo ou dados sensiveis em logs.
- Em fluxos de erro, preferir mensagens amigaveis e fallback seguro.

### Documentacao (`specs`)

- `specs/DESIGN_SPEC.md` deve continuar sendo o mapa de alto nivel do sistema.
- `specs/frontend/README.md` e `specs/backend/README.md` devem continuar servindo como arquivos centrais de lookup.
- Quando uma task mudar fluxo, contrato, integracao ou regra de negocio, atualize a spec correspondente no mesmo trabalho.
- Prefira documentacao enxuta, orientada a modulo e economica em tokens.

## 4) Seguranca

- Nao versionar `.env`.
- Nao registrar credenciais, tokens JWT, API keys ou payloads sensiveis em logs.
- Manter `withCredentials` e a logica de refresh alinhadas com o servico de autenticacao externo.
- Qualquer mudanca em CORS, cookies, auth ou notificacoes deve considerar impacto nas duas camadas.
- No backend, respeitar blacklist de token em Redis quando a rota usa autenticacao.
- No frontend, evitar assumir permissao apenas pela UI; o backend continua sendo a fonte de verdade para autorizacao.

## 5) Git Workflow -> Utilizar skill de commit (`./.codex/skills/commit-changes/SKILL.md`)

- Conventional commits: `feat(<scope>):`, `fix(<scope>):`, `refactor(<scope>):`, `docs(<scope>):`, `chore(<scope>):`, `test(<scope>):`, `perf(<scope>):`.
- Scopes recomendados: `api`, `auth`, `dashboard`, `user`, `store`, `worker`, `db`, `infra`, `ui`, `pwa`, `specs`.
- Antes de commitar, revise `git status`, mantenha o commit focado e evite misturar mudancas sem relacao.
- Sem force push.
- Sem commit direto em `main`/`master` sem solicitacao explicita.
- Nao comitar `.env`, `node_modules`, `dist/`, `coverage/` ou artefatos gerados.

## 6) Escopo de Arquivos

- Frontend: `cliente/src/{assets,components,composables,config,interceptors,router,services,stores,utils,views}`
- Backend: `server/src/{config,middlewares,routes,services,types,utils,workers}`
- Documentacao:
  - `specs/DESIGN_SPEC.md`
  - `specs/frontend/{README,ARCHITECTURE,ROUTES,BUSINESS_RULES,INTEGRATIONS}.md`
  - `specs/backend/{README,ROUTES,BUSINESS_RULES,INTEGRATIONS}.md`

## 7) Skills Locais Codex

- `./.codex/skills/commit-changes/SKILL.md`: protocolo para preparar e criar commits focados.

## 8) Protocolo de Uso das Specs

- Para task de frontend:
  - comecar em `specs/frontend/README.md`
  - abrir `ROUTES.md` se a task envolver pagina, navegacao ou fluxo de tela
  - abrir `BUSINESS_RULES.md` se envolver validacao, status, sessao, perfil, dashboard, loja ou comportamento de UI
  - abrir `INTEGRATIONS.md` se envolver API, auth, upload, env, Docker ou PWA
- Para task de backend:
  - comecar em `specs/backend/README.md`
  - abrir `ROUTES.md` se envolver endpoint, payload, auth ou resposta
  - abrir `BUSINESS_RULES.md` se envolver avaliacao, pontuacao, notificacao, loja, dashboard ou unidade Dass
  - abrir `INTEGRATIONS.md` se envolver PostgreSQL, Redis, RabbitMQ, Gemini, auth externa ou deploy
- Para mudancas transversais:
  - abrir `specs/DESIGN_SPEC.md` primeiro
  - depois navegar para as specs especificas das camadas impactadas
