# Backend Routes

Este documento separa:

- `estado atual`: comportamento observado no código hoje
- `modelo-alvo`: direção arquitetural esperada para a Fase 2

## Módulo `/pense-aja`

### `GET /pense-aja/products/:dassOffice`

Estado atual:

- lista produtos da loja por unidade
- não exige autenticação
- lê de `pense_aja.pense_aja_loja`

Modelo-alvo:

- pode continuar público para leitura autenticada ou semiautenticada, conforme regra final do produto
- deverá respeitar visibilidade e disponibilidade por unidade
- deve expor metadados suficientes para distinguir item físico e voucher

### `PUT /pense-aja/purchase/:registration`

Estado atual:

- registra resgate em passo único
- exige `verifyToken` e `roleVerificationAccess`
- calcula saldo como `pontos - pontos_resgatados`
- insere uma linha em `pense_aja.pense_aja_premios`

Modelo-alvo:

- o fluxo atual deve evoluir para workflow de marketplace
- a primeira operação sensível será a solicitação de resgate com reserva imediata de saldo
- aprovação, separação, entrega, emissão de voucher, cancelamento e estorno devem virar transições explícitas
- nenhum débito definitivo deve ocorrer sem reserva anterior

### `PUT /pense-aja/products/:dassOffice`

Estado atual:

- atualiza produtos em lote parcial
- exige token e autorização hardcoded por papel

Modelo-alvo:

- a gestão de catálogo deve usar permissão operacional específica de marketplace
- alterações relevantes de catálogo devem gerar trilha de auditoria

### `GET /pense-aja/:dassOffice`

Estado atual:

- lista ideias por unidade e filtros
- não exige autenticação
- filtra `excluido = false`
- inclui `pontuacao` quando existir linha em `pense_aja.pense_aja_pontos`

Modelo-alvo:

- a listagem deve continuar centrada em leitura consolidada
- a coluna de pontuação deve ser tratada como projeção de leitura do ledger, não como valor diretamente autoritativo de tabela legada

### `POST /pense-aja/:dassOffice`

Estado atual:

- cria novo cadastro de ideia
- hoje não exige autenticação no código
- usa lock transacional para reduzir duplicidade
- notifica gerente quando elegível

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

Estado atual:

- exige `verifyToken` e `roleVerificationAccess`
- usa `funcao` do usuário para decidir se atua como analista ou gerente
- reprovação ou exclusão por gerente remove pontos em vez de gerar reversão auditável
- aprovação com nota cria ou atualiza `pense_aja.pense_aja_pontos`

Modelo-alvo:

- o middleware de papel deve ser substituído por autorização dinâmica por unidade
- a avaliação deve respeitar workflow configurável por unidade
- toda transição relevante deve gerar evento auditável com `before` e `after`
- toda mudança de pontuação deve virar lançamento no ledger

## Módulo `/user`

### `GET /user/:registration`

Estado atual:

- entrega dados básicos, classificações, pontuação acumulada, pontos resgatados, email e apps autorizados

Modelo-alvo:

- deve continuar entregando visão consolidada ao frontend
- saldo e histórico devem vir de projeções consistentes do ledger e do marketplace

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
- parte dos widgets usa inferência ou dados sintéticos para apresentação

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
- endpoints novos de RBAC, auditoria, ledger e marketplace devem nascer apenas quando a refatoração técnica começar

## Tratamento global de erro

O app possui middleware global que:

- usa `CustomError.statusCode` quando disponível
- responde `500` nos demais casos
- acrescenta `"Contate a equipe de automação!"` à mensagem
- inclui `details` apenas quando `DEV_ENV === "development"`
