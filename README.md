# Pense Aja

Aplicação interna do Grupo Dass para captura, avaliação e operacionalização de ideias de melhoria. O repositório reúne o frontend web/PWA em Vue 3, a API backend em Express + TypeScript e as `specs/`, que são a referência principal para entendimento do sistema e para a evolução arquitetural em curso.

## Contexto

O Pense&Aja combina inovação aberta com gamificação operacional:

- colaboradores submetem ideias
- avaliadores autorizados analisam e classificam essas ideias
- avaliações válidas geram reconhecimento em pontos
- pontos podem ser convertidos em recompensas
- dashboards e notificações acompanham o ciclo completo

O projeto está em transição de um modelo mais orgânico para uma arquitetura auditável e multiunidade, com os seguintes princípios:

- backend como fonte de verdade
- autorização dinâmica por unidade Dass
- ledger auditável para pontuação
- marketplace automatizado com workflow operacional
- compatibilidade progressiva de API

## Estrutura do repositório

```text
.
├── cliente/   # frontend Vue 3 + Vite + Pinia + Vuetify + PWA
├── server/    # API Express + TypeScript + PostgreSQL + Redis + RabbitMQ
├── specs/     # documentação funcional e técnica
└── IMPLEMENTATION_PLAN.md
```

## Arquitetura em alto nível

### Frontend

O frontend em `cliente/` entrega a experiência operacional do produto:

- cadastro e consulta de ideias
- avaliação guiada por permissões resolvidas no backend
- dashboard e relatórios
- perfil, preferências e notificações
- loja e resgates

Tecnologias principais:

- Vue 3 + Vite
- Pinia + Vue Router
- Vuetify + Tailwind
- Axios com `withCredentials`
- Chart.js e `xlsx`

### Backend

O backend em `server/` é responsável por:

- validar unidade, sessão, payload e regras críticas
- resolver autorização por unidade
- persistir ideias, eventos e integrações de domínio
- consolidar pontuação e resgates com lastro auditável
- expor dados operacionais e analíticos ao frontend

Tecnologias principais:

- Express 5 + TypeScript
- PostgreSQL
- Redis
- RabbitMQ
- Gemini

## Modelo de negócio documentado

As specs agora tratam dois planos em paralelo:

- `estado atual`: o que o código faz hoje
- `modelo-alvo`: a arquitetura que deve orientar a refatoração backend-first

Pilares do modelo-alvo:

1. identidade continua vindo do serviço externo de autenticação
2. autorização deixa de ser `hardcoded` e passa a ser dinâmica por unidade
3. pontuação passa a ser registrada em ledger append-only
4. saldo é derivado de projeção materializada
5. resgates usam reserva, aprovação, fulfillment e estorno quando necessário
6. eventos críticos geram trilha de auditoria com ator, timestamp e diff

## Fluxo operacional alvo

1. o colaborador resolve sua unidade e cadastra a ideia
2. a API valida o contexto e persiste o registro
3. o workflow de avaliação aplicável à unidade define as etapas e permissões
4. decisões válidas geram eventos auditáveis e, quando aplicável, lançamentos no ledger
5. o saldo disponível habilita resgates no marketplace
6. o resgate cria reserva, segue workflow operacional e só então vira débito definitivo
7. dashboard, perfil e notificações consomem estados consolidados do backend

## Integrações externas

### Autenticação

O login não acontece neste repositório. O frontend consome um serviço externo de autenticação na porta `2399` para:

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/token/refresh`

O backend do Pense&Aja consome o cookie JWT emitido por esse serviço e usa essa identidade para resolver permissões localmente.

### Banco e mensageria

- PostgreSQL: fonte primária de dados de negócio
- Redis: blacklist de token e apoio de sessão
- RabbitMQ: filas assíncronas operacionais

### IA e notificações

- Gemini para melhoria de texto
- API externa de notificação
- futuros provedores de voucher devem entrar como integração do marketplace

## Execução local

### Frontend

```bash
cd cliente
npm install
npm run dev
```

Variável principal:

- `VITE_API_URL`

### Backend

```bash
cd server
npm install
npm run dev
```

Scripts principais:

- `npm run dev`
- `npm run build`
- `npm start`

Variáveis usadas hoje no backend:

- `IP`
- `PORT`
- `PASS`
- `USERS`
- `DBASE`
- `RABBITMQ_URL`
- `JWT_SECRET`
- `DEV_ENV`
- `GEMINI_API_KEY`
- `NOTIFICATION_API`
- `NOTIFICATION_API_KEY`
- `REDIS_HOST`
- `REDIS_PASS`

## Documentação

Use esta ordem de leitura:

- `IMPLEMENTATION_PLAN.md`
- `specs/DESIGN_SPEC.md`
- `specs/backend/README.md`
- `specs/backend/BUSINESS_RULES.md`
- `specs/backend/ROUTES.md`
- `specs/backend/INTEGRATIONS.md`
- `specs/frontend/README.md`
- `specs/frontend/BUSINESS_RULES.md`
- `specs/frontend/INTEGRATIONS.md`

## Estado atual do repositório

- não há suíte automatizada de testes configurada
- parte do frontend ainda infere permissões localmente
- o backend ainda usa verificação `hardcoded` por substring de `funcao`
- a modelagem atual de pontos e resgates ainda não implementa o ledger-alvo
- contratos de auth e notificação continuam fora deste repositório
