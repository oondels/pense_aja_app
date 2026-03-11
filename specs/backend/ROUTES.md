# Backend Routes

## `GET /pense-aja/products/:dassOffice`

Lista produtos da loja para a unidade informada.

- Auth: não exige.
- Entrada: `dassOffice` em `params`.
- Validação: retorna `400` se a unidade não vier; a service valida se a unidade está na lista permitida.
- Fonte: tabela `pense_aja.pense_aja_loja`.
- Saída: `id`, `nome`, `imagem`, `valor`, `user_create`, `created_at`.

## `PUT /pense-aja/purchase/:registration`

Registra o resgate de um prêmio.

- Auth: exige `verifyToken` e `roleVerificationAccess`.
- Entrada:
  - `registration` em `params`
  - `product`, `colaboradorData`, `analista`, `dassOffice` em `body`
- Regras:
  - matrícula deve ser numérica
  - usuário precisa existir
  - pontos disponíveis = `pontos - pontos_resgatados`
  - o produto precisa existir
  - o usuário precisa ter pontos suficientes
- Efeito colateral: insere linha em `pense_aja.pense_aja_premios`.

## `PUT /pense-aja/products/:dassOffice`

Atualiza um ou mais produtos da loja.

- Auth: exige `verifyToken` e `roleVerificationAccess`.
- Entrada: array de produtos com `id`, `nome`, `valor`.
- Regras:
  - a lista não pode ser vazia
  - cada produto é validado individualmente
  - apenas produtos da unidade informada podem ser atualizados
  - o usuário autenticado vira `updated_by`
- Transação:
  - se nenhum item for atualizado com sucesso, a transação é revertida
  - se ao menos um item for atualizado, o commit é mantido

## `GET /pense-aja/:dassOffice`

Consulta registros de ideias por unidade e filtros.

- Auth: não exige.
- Query params aceitos:
  - `startDate`
  - `endDate`
  - `name`
  - `sector`
  - `manager`
  - `project`
  - `turno`
  - `status`
- Regras:
  - `startDate` e `endDate` devem ser datas válidas quando enviados
  - consulta apenas registros `excluido = false`
  - intervalo final inclui o dia inteiro via `+ interval '1 day'`
  - `turno` é traduzido para `A`, `B` ou `C`
- Ordenação: `createdat DESC`

## `POST /pense-aja/:dassOffice`

Cria um novo registro de ideia.

- Auth: não exige no código atual.
- Entrada: payload de cadastro do frontend.
- Campos obrigatórios na service:
  - `nome`
  - `createDate`
  - `situationBefore`
  - `situationNow`
  - `registration`
  - `userName`
  - `gerente`
  - `setor`
  - `turno`
  - `areaMelhoria`
  - `factory`
- Regras:
  - inicializa `perdas` como lista vazia se ausente
  - converte as 8 perdas lean em colunas binárias
  - usa `pg_advisory_xact_lock` para reduzir duplicidade concorrente
  - considera duplicado um registro com mesma matrícula, nome do projeto, data realizada e unidade
- Efeitos colaterais:
  - persiste em `pense_aja.pense_aja_dass`
  - consulta o gerente do colaborador
  - envia notificação ao gerente se ele existir e tiver notificações ativas
- Resposta:
  - `201` quando cria
  - `200` quando detecta duplicidade e ignora a nova inserção

## `GET /pense-aja/:dassOffice/:id`

Busca detalhes completos de um registro.

- Auth: não exige.
- Regras:
  - valida unidade
  - retorna `404` se não encontrar o registro
- Uso principal: tela de detalhe e avaliação.

## `PUT /pense-aja/avaliar/:id`

Avalia, reprova ou exclui um registro.

- Auth: exige `verifyToken` e `roleVerificationAccess`.
- Entrada:
  - `id` em `params`
  - dados de avaliação em `body`
  - identidade do avaliador é enriquecida com `req.user`
- Regras centrais:
  - analista atualiza campos de analista
  - gerente e admin atualizam campos de gerente
  - apenas gerente ou admin podem excluir
  - não é permitido `status = reprove` com nota/classificação preenchida
  - `exclude` marca `excluido = true`
  - demais status atualizam `classificacao`, `a3_mae`, `em_espera` e `replicavel`
  - ao reprovar ou excluir como gerente, os pontos do registro são removidos
  - ao aprovar com nota, cria ou atualiza pontuação em `pense_aja.pense_aja_pontos`
- Efeitos colaterais:
  - pode enviar notificação por email ao colaborador avaliado

## `GET /user/:registration`

Carrega dados consolidados do colaborador.

- Auth: não exige.
- Entrada:
  - `registration` em `params`
  - `dassOffice` em `query`
- Regras:
  - matrícula precisa ter ao menos 7 caracteres
  - matrícula deve ser numérica
  - unidade deve ser string válida
- Retorna:
  - dados básicos do colaborador
  - pontuação acumulada
  - pontos já resgatados
  - classificações agregadas
  - email
  - apps autorizados para notificação

## `GET /user/unidade/:registration`

Resolve a unidade do usuário pela matrícula.

- Auth: não exige.
- Regra:
  - usa o primeiro dígito da matrícula para consultar `core.unidades_dass`
- Retorna:
  - `dassOffice`
  - `location`

## `PUT /user/:registration`

Atualiza email e preferências de notificação.

- Auth: exige `verifyToken`.
- Entrada:
  - `registration` em `params`
  - `formData` e `dassOffice` em `body`
- Regras:
  - matrícula mínima de 7 caracteres
  - matrícula numérica
  - `formData.email` deve ser string válida
  - email precisa terminar em `@grupodass.com.br`
  - se a lista `authorized_notifications_apps` vier vazia, a service grava `["null"]`
- Persistência: `autenticacao.emails`

## `GET /dashboard/summary/:dassOffice`

Entrega indicadores gerais por unidade e período.

- Auth: não exige.
- Query params: `startDate`, `endDate`
- Métricas:
  - total de ideias
  - implementadas
  - pendentes
  - rejeitadas
  - aprovadas por gerente
  - em análise
  - valor total
  - valor médio

## `GET /dashboard/monthly/:dassOffice`

Entrega série mensal agregada.

- Auth: não exige.
- Query params: `startDate`, `endDate`
- Métricas:
  - volume mensal
  - total de aprovados por mês
- Observação:
  - o campo `value` retornado hoje representa quantidade de aprovados, não valor financeiro

## `GET /dashboard/dimensional/:dassOffice`

Entrega ranking por dimensões organizacionais.

- Auth: não exige.
- Query params: `startDate`, `endDate`
- Retorno:
  - top 10 gerentes
  - top 10 setores
  - top 10 fábricas

## `GET /dashboard/idea-highlights/:dassOffice`

Entrega ideias de destaque para cards visuais.

- Auth: não exige.
- Critério:
  - prioriza aprovadas por valor amortizado
  - desempata por data
- Observações de implementação:
  - categoria é inferida do nome do setor
  - likes e comments são simulados em memória, não persistidos

## `GET /dashboard/engagement/:dassOffice`

Entrega ranking de colaboradores mais engajados.

- Auth: não exige.
- Query params: `startDate`, `endDate`
- Critério:
  - conta ideias por colaborador
  - conta implementações usando aprovação do gerente
  - limita top 10
- Observações:
  - cargo e departamento são inferidos por heurística baseada no setor e volume de ideias

## `POST /ai/improve-text`

Melhora a escrita de textos do cadastro usando Gemini.

- Auth: não exige no código atual.
- Entrada:
  - `situationBefore`
  - `situationNow`
  - `projectName`
- Regras:
  - todos os campos devem ser string não vazia
  - o texto é sanitizado removendo crases, cifrão e barra invertida
  - a chamada é bloqueada se o prompt exceder 3000 tokens
- Saída:
  - objeto com `before` e `after`

## Tratamento global de erro

O app possui middleware global que:

- usa `CustomError.statusCode` quando disponível
- responde `500` nos demais casos
- acrescenta `"Contate a equipe de automação!"` à mensagem
- inclui `details` apenas quando `DEV_ENV === "development"`
