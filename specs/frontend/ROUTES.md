# Frontend Routes

## `/`

Landing page institucional.

- View: `cliente/src/views/Home.vue`
- Objetivo:
  - apresentar o produto
  - comunicar benefícios
  - direcionar o usuário para `/pense-aja`
- Comportamento:
  - botão principal navega para a área operacional
  - não exige login

## `/pense-aja`

Tela principal do produto.

- View: `cliente/src/views/PenseAja.vue`
- Componente central: `cliente/src/components/ListaPenseAja.vue`
- Objetivo:
  - listar ideias existentes
  - permitir busca e filtragem
  - servir como ponto de entrada para cadastro
- Comportamento:
  - renderiza badge com contagem de registros
  - usa carregamento assíncrono para `ListaPenseAja`
  - depende de `unidadeDass` em `localStorage` para buscar dados corretamente

### Regras visíveis na UI

- filtros por ano, mês, nome, gerente, setor, status, projeto e turno
- versão mobile esconde filtros dentro de expansion panel
- status são apresentados com legenda visual própria

## `/pense-aja/:id`

Tela de detalhe e avaliação de um registro.

- View: `cliente/src/views/ItemPenseAja.vue`
- Objetivo:
  - mostrar dados completos do Pense Aja
  - permitir avaliação por usuários autorizados
- Comportamento:
  - exibe loading, erro ou detalhe
  - separa visualmente status, avaliadores, dados do colaborador e antes/depois
  - usa heurística local para rotular status em linguagem de UI

### Regras de interação

- usuários sem permissão continuam conseguindo visualizar a tela
- o ato de avaliar depende da service `evaluatePenseAjaService.js`
- o backend é quem valida a permissão real

## `/dashboard`

Tela analítica e de relatório.

- View: `cliente/src/views/Dashboard.vue`
- Componentes:
  - `DashboardSummary`
  - `MonthlyTrendsChart`
  - `DimensionalAnalysis`
  - `IdeaHighlights`
  - `EngagementPanel`
- Objetivo:
  - exibir métricas agregadas
  - permitir exportação de relatório em XLSX

### Regras de UI

- o período padrão vai de `01/01` do ano atual até hoje
- o card `Implementadas` exibe a métrica consolidada do backend: ideias fora de espera com aprovação de analista ou gerente
- o relatório só é gerado se `startDate` e `endDate` forem válidos
- a exportação monta planilhas no browser usando `xlsx`
- várias abas previstas no relatório estão comentadas no código

## `/admin/unit-settings`

Página de configurações operacionais da unidade.

- View: `cliente/src/views/AdminUnitSettings.vue`
- Objetivo:
  - configurar classificações e pontuação por unidade
  - configurar limite de bonificação por avaliação
  - configurar etapas de workflow de avaliação
  - configurar política de marketplace
  - registrar ajustes manuais de pontuação quando autorizado
  - centralizar acesso às gestões de catálogo e RBAC
- Permissão visual:
  - exige `unit.config.manage`
  - a guia de ajustes exige também `points.adjust`
- Integração:
  - usa `GET /unit-settings/:dassOffice`
  - usa `PUT /unit-settings/:dassOffice`
  - usa `POST /user/:registration/points-adjustments`
  - a sessão também carrega `unitConfig` por `GET /user/session-context/:dassOffice`

## `/user`

Tela de perfil e preferências.

- View: `cliente/src/views/UserPage.vue`
- Objetivo:
  - mostrar dados do colaborador
  - exibir pontuação e classificações
  - permitir atualizar email e notificações

### Regras de UI

- se `sessionStorage.matricula` não existir, a tela redireciona para `/`
- o botão salvar só fica habilitado quando o form muda
- o checkbox de notificação adiciona ou remove `pense_aja` do array `authorized_notifications_apps`

## `/news`

Tela de novidades e onboarding de release.

- View: `cliente/src/views/News.vue`
- Objetivo:
  - apresentar mudanças do app
  - servir como ponte de first-run após o popup de email
- Regras:
  - usa `localStorage.hasSeenNews` para disparar animação/confete apenas na primeira vez

## `/mic`

Tela/ferramenta de microfone e IA.

- Component: `cliente/src/components/AiTools/AiMicrofone.vue`
- Observação:
  - a rota existe, mas não é uma área principal do fluxo atual
  - depende de implementação específica do componente

## Routing Characteristics

- todas as rotas são lazy loaded
- não existe guard global de autenticação
- o controle de acesso é feito mais por renderização condicional e checagens locais do que por router guards
