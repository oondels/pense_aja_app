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
- a exportação consome `GET /dashboard/summary/:dassOffice?includeReport=true`
  e monta planilhas no browser usando `xlsx`
- o XLSX separa métricas de avaliação de Admin e Avaliador de ideias em abas próprias

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
- Regras de UI:
  - classificação de pontos mostra resumo em cards e formulário com labels
  - adicionar pontuação cria automaticamente a próxima letra ativa
  - remover pontuação desativa a última letra ativa e preserva `A`

## `/admin/catalog`

Tela administrativa do catálogo de recompensas.

- View: `cliente/src/views/AdminCatalog.vue`
- Objetivo:
  - gerenciar recompensas da unidade em cards ou lista editável
  - cadastrar novo produto com upload de imagem
  - salvar alterações de nome, imagem, pontos, tipo, estoque e status ativo
- Permissão visual:
  - exige `catalog.manage`
- Integração:
  - lista catálogo por `GET /marketplace/catalog/:dassOffice`
  - salva edições por `PUT /marketplace/catalog/:dassOffice`
  - cadastra novo produto pelo upload service usado pela loja
- Regras de UI:
  - cadastro novo abre modal no padrão do `Edit Store`
  - visualização alterna entre cards e lista, com preferência persistida em `localStorage`
  - feedback usa `Notification.vue`
  - upload aceita apenas imagem e limita arquivo a 5MB

## `/admin/marketplace`

Tela administrativa de solicitações de marketplace.

- View: `cliente/src/views/AdminMarketplace.vue`
- Objetivo:
  - listar solicitações por unidade com filtros de status e matrícula
  - paginar em 5 solicitações por página
  - aprovar, rejeitar ou estornar quando autorizado
  - exibir acompanhamento em popup ao clicar na solicitação
  - exibir nome do solicitante quando retornado pelo backend
- Permissão visual:
  - exige `marketplace.request.approve`
- Integração:
  - usa `GET /marketplace/requests`
  - usa `PUT /marketplace/requests/:id/approve`
  - usa `PUT /marketplace/requests/:id/reject`
  - usa `PUT /marketplace/requests/:id/refund`
- Regras de UI:
  - alterna entre cards e lista, com preferência persistida em `localStorage`

## `/marketplace/requests`

Tela de consulta de solicitações de resgate.

- View: `cliente/src/views/MarketplaceRequests.vue`
- Objetivo:
  - usuário logado consulta automaticamente suas solicitações
  - usuário não logado consulta por unidade e matrícula
  - filtrar por status e acompanhar a linha do tempo em popup
- Integração:
  - usuário logado usa `GET /marketplace/requests/me`
  - usuário não logado usa `GET /marketplace/requests/public`
- Regras de UI:
  - não permite edição ou transição de status
  - pagina em 5 solicitações por página
  - alterna entre cards e lista, com preferência persistida em `localStorage`

## `/admin/rbac`

Tela administrativa de permissões e papéis.

- View: `cliente/src/views/AdminRbac.vue`
- Objetivo:
  - listar vínculos RBAC por matrícula, papel, unidade e vigência
  - criar, editar e remover vínculos quando autorizado
  - exibir nome do usuário vinculado quando retornado pelo backend
- Permissão visual:
  - exige `rbac.manage`
- Regras de UI:
  - lista e formulário usam apenas papéis retornados pelo backend para o escopo do admin
  - permite cadastrar e editar múltiplos papéis para a mesma matrícula em uma ação
  - editar papéis adiciona/atualiza os papéis selecionados e não remove papéis omitidos
  - exibe legenda explicativa dos papéis disponíveis, sem códigos técnicos
  - possui filtros por busca, matrícula, papel e status
  - somente `admin_master` vê o filtro por unidade e pode listar todas as unidades
  - alterna entre cards e lista, com preferência persistida em `localStorage`

## `/user`

Tela de perfil e preferências.

- View: `cliente/src/views/UserPage.vue`
- Objetivo:
  - mostrar dados do colaborador
  - exibir saldo, pontuação, classificações e registros do colaborador
  - exibir solicitações de resgate do usuário
  - permitir atualizar email e notificações

### Regras de UI

- se `sessionStorage.matricula` não existir, a tela redireciona para `/`
- o botão salvar só fica habilitado quando o form muda
- o checkbox de notificação adiciona ou remove `pense_aja` do array `authorized_notifications_apps`
- saldos usam os campos consolidados do backend, sem cálculo local de saldo
- solicitações de resgate usam `GET /marketplace/requests/me`

## `/user/points-history`

Histórico de ledger da matrícula autenticada.

- View: `cliente/src/views/PointsHistory.vue`
- Objetivo:
  - exibir movimentações de pontos por tipo, origem, ator, motivo e data
  - alternar entre visualização em lista e cards
- Integração:
  - usa `GET /user/:registration/points-history`

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
