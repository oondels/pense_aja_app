# Backend Routes

Este documento separa:

- `estado atual`: comportamento observado no código hoje
- `modelo-alvo`: direção arquitetural esperada para a Fase 2

## Módulo `/pense-aja`

### `GET /pense-aja/products/:dassOffice`

Estado atual após corte direto:

- lista produtos da loja por unidade
- não exige autenticação
- lê de `pense_aja.marketplace_catalog_items`

Modelo-alvo:

- pode continuar público para leitura autenticada ou semiautenticada, conforme regra final do produto
- deverá respeitar visibilidade e disponibilidade por unidade
- deve expor metadados suficientes para distinguir item físico e voucher

### `PUT /pense-aja/purchase/:registration`

Estado atual após corte direto:

- mantido como compatibilidade, mas grava em `marketplace_redemption_requests`
- exige `verifyToken` e autorização dinâmica
- reserva e confirma saldo via `points_ledger_entries`
- não insere novas linhas em `pense_aja.pense_aja_premios`

Modelo-alvo:

- o fluxo atual deve evoluir para workflow de marketplace
- a primeira operação sensível será a solicitação de resgate com reserva imediata de saldo
- aprovação, separação, entrega, emissão de voucher, cancelamento e estorno devem virar transições explícitas
- nenhum débito definitivo deve ocorrer sem reserva anterior

### `PUT /pense-aja/products/:dassOffice`

Estado atual após corte direto:

- atualiza produtos em lote parcial
- exige token e permissão `catalog.manage`
- grava em `marketplace_catalog_items` e gera auditoria

Modelo-alvo:

- a gestão de catálogo deve usar permissão operacional específica de marketplace
- alterações relevantes de catálogo devem gerar trilha de auditoria

### `GET /pense-aja/:dassOffice`

Estado atual após corte direto:

- lista ideias por unidade e filtros
- não exige autenticação
- filtra `excluido = false`
- inclui `pontuacao` a partir do saldo líquido de ledger por ideia

Modelo-alvo:

- a listagem deve continuar centrada em leitura consolidada
- a coluna de pontuação deve ser tratada como projeção de leitura do ledger, não como valor diretamente autoritativo de tabela legada

### `POST /pense-aja/:dassOffice`

Estado atual após corte direto:

- cria novo cadastro de ideia
- exige `verifyToken` e permissão `idea.submit`
- usa lock transacional para reduzir duplicidade
- tenta notificar gerente quando elegível, sem bloquear o cadastro se email ou notificação falhar
- gera evento `idea.created`

Modelo-alvo:

- o cadastro deve continuar sendo o ponto de entrada do ciclo
- o registro deve gerar evento auditável de criação
- regras de autenticação e autoria devem ser revisadas na Fase 2 sem quebrar indevidamente o fluxo atual

### `GET /pense-aja/:dassOffice/:id`

Estado atual:

- retorna detalhes completos da ideia
- não exige autenticação

Modelo-alvo:

- deve continuar expondo o contexto funcional da ideia
- pode evoluir para incluir histórico resumido de avaliação e estado operacional

### `PUT /pense-aja/avaliar/:id`

Estado atual após corte direto:

- exige `verifyToken` e permissão `idea.evaluate`
- usa permissões efetivas da sessão para diferenciar avaliador comum e permissão de exclusão
- reprovação, exclusão ou reavaliação geram `reverse` no ledger
- aprovação com nota gera `earn` em `points_ledger_entries`, sem nova escrita em `pense_aja_pontos`
- busca de email, opt-in e envio de notificação são pós-processamento não bloqueante

Modelo-alvo:

- o middleware de papel deve ser substituído por autorização dinâmica por unidade
- a avaliação deve respeitar workflow configurável por unidade
- toda transição relevante deve gerar evento auditável com `before` e `after`
- toda mudança de pontuação deve virar lançamento no ledger

## Módulo `/user`

### `GET /user/session-context/:dassOffice`

Estado atual após corte direto:

- exige `verifyToken`
- resolve permissões efetivas por unidade em RBAC
- persiste snapshot curto em `rbac_session_snapshots`

Modelo-alvo:

- continua sendo a fonte de contexto autorizador para o frontend

### `GET /user/rbac/roles`
### `GET /user/rbac/assignments`
### `GET /user/rbac/assignments/:id`
### `POST /user/rbac/assignments`
### `PUT /user/rbac/assignments/:id`
### `DELETE /user/rbac/assignments/:id`

Estado atual:

- administração de RBAC passa a ser manual
- rotas protegidas exigem token e permissão `rbac.manage`
- a administração é destinada a usuários com papel `admin_master`

Modelo-alvo:

- `admin_master` gerencia vínculos usuário/unidade/papel
- a população de RBAC deixa de depender de backfill heurístico por `funcao`
- alterações de vínculo devem invalidar snapshots de sessão da unidade afetada

### `GET /user/:registration`

Estado atual:

- entrega dados básicos, classificações, pontuação acumulada, pontos resgatados, email e apps autorizados

Modelo-alvo:

- deve continuar entregando visão consolidada ao frontend
- saldo e histórico devem vir de projeções consistentes do ledger e do marketplace

### `GET /user/:registration/points-history`

Estado atual após corte direto:

- retorna histórico do usuário em `points_ledger_entries`
- exige `dassOffice` válido em query string

Modelo-alvo:

- permanece como trilha de leitura do ledger append-only

## Módulo `/marketplace`

### `GET /marketplace/catalog/:dassOffice`
### `PUT /marketplace/catalog/:dassOffice`
### `POST /marketplace/requests`
### `GET /marketplace/requests`
### `PUT /marketplace/requests/:id/approve`
### `PUT /marketplace/requests/:id/reject`
### `PUT /marketplace/requests/:id/fulfillment`
### `PUT /marketplace/requests/:id/complete`
### `PUT /marketplace/requests/:id/cancel`
### `PUT /marketplace/requests/:id/refund`

Estado atual após corte direto:

- catálogo operacional usa `marketplace_catalog_items`
- solicitação cria `reserve` no ledger e status `pending_approval`
- rejeição ou cancelamento antes de commit gera `release`
- conclusão de entrega/emissão gera `commit`
- estorno após conclusão gera `refund`
- fulfillment físico e voucher registram passos em `marketplace_fulfillment_steps`
- voucher usa adapter `noop` configurável e registra entrega em `marketplace_voucher_deliveries`

Modelo-alvo:

- marketplace é o fluxo canônico para resgate, aprovação, fulfillment e reconciliação

### `GET /user/unidade/:registration`

Estado atual:

- resolve unidade a partir da matrícula em `core.unidades_dass`

Modelo-alvo:

- permanece como lookup de contexto
- pode ser complementado por regras de elegibilidade e múltiplos escopos por sessão

### `PUT /user/:registration`

Estado atual:

- atualiza email e preferências de notificação
- mantém fallback `["null"]` para lista vazia

Modelo-alvo:

- preferências devem preservar compatibilidade
- o fallback legado deve ser tratado como dívida técnica e não como semântica ideal

## Módulo `/dashboard`

### `GET /dashboard/summary/:dassOffice`
### `GET /dashboard/monthly/:dassOffice`
### `GET /dashboard/dimensional/:dassOffice`
### `GET /dashboard/idea-highlights/:dassOffice`
### `GET /dashboard/engagement/:dassOffice`

Estado atual:

- endpoints de leitura agregada por unidade
- não exigem autenticação
- resumo inclui métricas de ledger e marketplace
- destaques não geram likes/comments aleatórios como dado canônico

Modelo-alvo:

- dashboards devem consumir projeções derivadas do backend
- métricas de pontuação e resgate devem refletir ledger e marketplace auditável
- dados sintéticos ou heurísticos devem ser claramente segregados de dados canônicos

## Módulo `/ai`

### `POST /ai/improve-text`

Estado atual:

- melhora texto de cadastro
- não exige autenticação no código atual

Modelo-alvo:

- IA continua auxiliar do fluxo
- não deve participar de decisão autorizadora, pontuação ou mudança formal de status

## Observações de contrato

- a Fase 1 não redefine os endpoints já existentes como implementados de outra forma; ela documenta a evolução esperada
- na Fase 2, a compatibilidade progressiva deve ser preservada sempre que possível
- endpoints de RBAC, ledger e marketplace já fazem parte do corte direto backend

## Tratamento global de erro

O app possui middleware global que:

- usa `CustomError.statusCode` quando disponível
- responde `500` nos demais casos
- acrescenta `"Contate a equipe de automação!"` à mensagem
- inclui `details` apenas quando `DEV_ENV === "development"`
