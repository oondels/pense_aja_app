# Backend Routes

Este documento descreve o contrato atual das rotas do backend Pense Aja.
Ele deve ser lido como referência operacional do que está implementado em
`server/src/routes/*` e nos controllers/services correspondentes.

## Convenções

- Rotas protegidas usam `verifyToken` e esperam token válido no cookie `token`.
- Autorização operacional usa permissões RBAC resolvidas por unidade Dass.
- Parâmetros `dassOffice` são validados como unidade Dass válida nos controllers ou services.
- Filtros de data aceitam strings parseáveis por `Date.parse`; valores inválidos retornam `400`.
- Escritas sensíveis de ideias, catálogo, marketplace e ledger geram eventos de auditoria quando o fluxo possui trilha operacional.

## Rotas de suporte

### `GET /`

- Retorna mensagem simples da API.

### `GET /docs`
### `GET /docs/openapi.yaml`

- Expõem a documentação Swagger/OpenAPI servida pelo backend.

## Módulo `/pense-aja`

### `GET /pense-aja/products/:dassOffice`

- Lista produtos ativos da loja para a unidade informada.
- Não exige autenticação.
- Lê de `pense_aja.marketplace_catalog_items`.
- Mantém formato de resposta legado com `id`, `nome`, `imagem`, `valor`, `user_create` e `created_at`.

### `PUT /pense-aja/purchase/:registration`

- Endpoint legado de resgate direto por matrícula.
- Exige `verifyToken` e permissão `reward.legacy.redeem` no `dassOffice` enviado no corpo.
- Valida matrícula da URL, usuário, produto ativo e unidade Dass.
- Usa `marketplace_catalog_items` para localizar produto por `id` ou `legacy_product_id`.
- Recalcula e bloqueia `points_balance_projection` dentro da transação antes de validar saldo.
- Cria lançamento `reserve` e `commit` em `points_ledger_entries`.
- Cria solicitação concluída em `marketplace_redemption_requests`.
- Registra auditoria `marketplace.request.completed`.
- Não grava novos resgates na tabela legada `pense_aja.pense_aja_premios`.

### `PUT /pense-aja/products/:dassOffice`

- Atualiza produtos em lote parcial para a unidade informada.
- Exige `verifyToken` e permissão `catalog.manage`.
- Atualiza nome e custo em pontos de itens existentes em `marketplace_catalog_items`.
- Registra auditoria `catalog.item.updated` para produtos atualizados.
- Retorna erro quando nenhum item enviado é atualizado com sucesso.

### `GET /pense-aja/:dassOffice`

- Lista ideias por unidade.
- Não exige autenticação.
- Filtra `excluido = false`.
- Retorna `pontuacao` como saldo líquido de lançamentos `idea_evaluation` e `idea_evaluation_bonus` confirmados no ledger.
- Aceita filtros opcionais `startDate`, `endDate`, `name`, `sector`, `manager`, `project`, `turno` e `status`.
- `startDate` e `endDate` são opcionais; quando omitidos, a listagem não aplica recorte temporal.
- `endDate` é tratado como data inclusiva até o fim do dia informado.

### `POST /pense-aja/:dassOffice`

- Cria uma ideia Pense Aja na unidade informada.
- Exige `verifyToken` e permissão `idea.submit`.
- Valida campos obrigatórios do cadastro.
- Usa lock transacional para reduzir duplicidade por matrícula, projeto, data realizada e unidade.
- Quando encontra duplicidade, retorna a ideia existente sem criar novo registro.
- Registra evento `idea.created` para novos cadastros.
- Tenta notificar o gerente quando elegível; falhas de email ou notificação são tratadas como pós-processamento não bloqueante.

### `GET /pense-aja/:dassOffice/:id`

- Retorna detalhes completos da ideia.
- Não exige autenticação.
- Valida unidade Dass e busca a ideia pelo `id` na unidade informada.

### `GET /pense-aja/:dassOffice/:id/audit`

- Retorna a timeline de auditoria da ideia.
- Exige `verifyToken` e permissão `idea.view`.
- Retorna eventos com ator, motivo, estados `before`/`after`, metadata e `correlationId`.

### `PUT /pense-aja/avaliar/:id`

- Avalia, reprova ou exclui uma ideia.
- Exige `verifyToken` e permissão `idea.evaluate` no `dassOffice` enviado no corpo.
- Usa as permissões efetivas da sessão para determinar se a atuação é de avaliação comum ou de gerenciamento.
- Exclusão exige permissão adicional `idea.exclude`.
- Reprovação com avaliação preenchida retorna `400`.
- Reprovação, exclusão e reavaliação revertem pontuação anterior com lançamento `reverse` quando há saldo líquido da avaliação anterior.
- Aprovação com nota gera lançamento `earn` em `points_ledger_entries`.
- Avaliação aprovada pode enviar `bonusPoints` e `bonusJustification` para bonificação extra.
- A bonificação é limitada por `unit_configs.metadata.maxEvaluationBonusPoints` por unidade, com padrão `2`.
- Bonificação anterior é substituída na reavaliação e revertida quando a ideia é reprovada ou excluída.
- Payload novo deve enviar `classification` com letra canônica configurada na unidade (`A`, `B`, `C`, `D`...).
- `avaliacao` numérica permanece aceito apenas como compatibilidade temporária (`3 -> A`, `2 -> B`, `1 -> C`).
- Pontuação exige regra ativa e vigente em `unit_scoring_rules`; quando não há regra para a classificação, retorna `400`.
- Sincroniza `points_balance_projection` após mudança de pontuação.
- Registra auditoria `idea.evaluated` com estados antes/depois.
- Tenta notificar o usuário avaliado; falhas de notificação não bloqueiam a avaliação.

## Módulo `/unit-settings`

### `GET /unit-settings/:dassOffice`

- Exige `verifyToken` e permissão `unit.config.manage`.
- Retorna configuração editável da unidade: metadata geral, regras de pontuação, workflow e política de marketplace.
- Regras de pontuação usam letras canônicas, rótulo, descrição, pontos, ordem, vigência e flag ativa.

### `PUT /unit-settings/:dassOffice`

- Exige `verifyToken` e permissão `unit.config.manage`.
- Atualiza configurações da unidade em transação.
- Valida classificações por letras maiúsculas, pontuação positiva e ordem única entre regras ativas.
- Valida etapas de workflow com código, ordem, permissão exigida e metadata de slot.
- Desativa regras/etapas omitidas em vez de apagar fisicamente histórico de configuração.

## Módulo `/user`

### `GET /user/session-context/:dassOffice`

- Exige `verifyToken`.
- Resolve permissões efetivas do usuário para a unidade.
- Persiste snapshot curto em `rbac_session_snapshots`.
- Retorna matrícula, unidade, permissões, configuração efetiva da unidade, versão e expiração do snapshot.

### `GET /user/rbac/roles`

- Exige `verifyToken` e permissão `rbac.manage`.
- Lista papéis RBAC disponíveis.
- Usa `dassOffice` em query string para escopo de autorização.

### `GET /user/rbac/assignments`

- Exige `verifyToken` e permissão `rbac.manage`.
- Lista vínculos usuário/unidade/papel.
- Aceita filtros opcionais `registration`, `dassOffice` e `active`.

### `GET /user/rbac/assignments/:id`

- Exige `verifyToken` e permissão `rbac.manage`.
- Retorna um vínculo RBAC pelo identificador.
- Usa `dassOffice` em query string para escopo de autorização.

### `POST /user/rbac/assignments`

- Exige `verifyToken` e permissão `rbac.manage`.
- Cria vínculo de usuário, unidade e papel.
- Valida usuário de autenticação e papel RBAC.
- Impede vínculo duplicado para a mesma matrícula, unidade e papel.
- Invalida snapshots de sessão da matrícula na unidade afetada.

### `PUT /user/rbac/assignments/:id`

- Exige `verifyToken` e permissão `rbac.manage`.
- Atualiza papel, status ativo e janela de vigência do vínculo.
- Usa `dassOffice` do corpo ou da query string para escopo de autorização.
- Invalida snapshots de sessão da matrícula na unidade afetada.

### `DELETE /user/rbac/assignments/:id`

- Exige `verifyToken` e permissão `rbac.manage`.
- Remove vínculo RBAC.
- Usa `dassOffice` em query string para escopo de autorização.
- Invalida snapshots de sessão da matrícula na unidade afetada.

### `GET /user/unidade/:registration`

- Resolve a unidade Dass da matrícula.
- Não exige autenticação.
- Consulta `core.unidades_dass`.
- Retorna `400` quando a matrícula não é conhecida.

### `GET /user/:registration/points-history`

- Retorna histórico de pontos do usuário em `points_ledger_entries`.
- Exige `verifyToken`.
- Permite leitura própria quando a matrícula autenticada é igual à matrícula da URL.
- Leitura de terceiros exige permissão `marketplace.request.approve`.
- Exige `dassOffice` válido em query string.

### `POST /user/:registration/points-adjustments`

- Registra ajuste manual de pontuação da matrícula informada.
- Exige `verifyToken` e permissão `points.adjust` no `dassOffice` enviado no corpo.
- Permissão é atribuída a `unit_admin` e `admin_master`.
- Payload: `dassOffice`, `direction` (`credit` ou `debit`), `amount` inteiro positivo e `reason`.
- Crédito cria lançamento `earn` com `source_type = manual_adjustment`.
- Débito cria lançamento `reverse` com `source_type = manual_adjustment`.
- Débito é bloqueado quando deixaria o saldo disponível negativo.
- Registra auditoria `points.adjusted`.

### `GET /user/:registration`

- Retorna dados consolidados do usuário para a unidade enviada em query string.
- Não exige autenticação.
- Valida matrícula mínima, formato numérico e `dassOffice`.
- Inclui dados básicos, classificações, pontuação acumulada, pontos resgatados, saldo disponível, email e apps autorizados.
- Saldo e histórico são derivados do ledger e das projeções de pontos.

### `PUT /user/:registration`

- Atualiza email e preferências de notificação do usuário.
- Exige `verifyToken`.
- Valida matrícula, email e domínio `@grupodass.com.br`.
- Mantém compatibilidade com o fallback legado `["null"]` para lista vazia de apps autorizados.

## Módulo `/marketplace`

### `GET /marketplace/catalog/:dassOffice`

- Lista catálogo ativo da unidade.
- Não exige autenticação.
- Retorna metadados de item físico ou voucher, custo em pontos, disponibilidade e metadata.

### `PUT /marketplace/catalog/:dassOffice`

- Cria ou atualiza itens de catálogo operacional.
- Exige `verifyToken` e permissão `catalog.manage`.
- Aceita lote de itens.
- Valida nome e custo positivo.
- Registra auditoria `catalog.item.created` ou `catalog.item.updated`.
- Retorna o catálogo ativo atualizado.

### `POST /marketplace/requests`

- Cria solicitação de resgate.
- Exige `verifyToken` e permissão `marketplace.request.create`.
- Usa `registration` do corpo quando enviado; caso contrário, usa a matrícula do ator autenticado.
- Valida item ativo, disponibilidade e saldo disponível.
- Bloqueia `points_balance_projection` com `FOR UPDATE`.
- Cria lançamento `reserve` no ledger.
- Cria solicitação `pending_approval` em `marketplace_redemption_requests`.
- Registra auditoria `marketplace.request.created`.

### `GET /marketplace/requests`

- Lista solicitações de resgate da unidade.
- Exige `verifyToken` e permissão `marketplace.request.approve`.
- Exige `dassOffice` em query string.
- Ordena por atualização mais recente.

### `PUT /marketplace/requests/:id/approve`

- Aprova solicitação pendente.
- Exige `verifyToken` e permissão `marketplace.request.approve`.
- Transiciona `pending_approval` para `completed`.
- Cria lançamento `commit` relacionado à reserva.
- Registra auditoria `marketplace.request.approved`.

### `PUT /marketplace/requests/:id/reject`

- Rejeita solicitação pendente.
- Exige `verifyToken` e permissão `marketplace.request.approve`.
- Transiciona `pending_approval` para `rejected`.
- Cria lançamento `release` relacionado à reserva.
- Registra auditoria `marketplace.request.rejected`.

### `PUT /marketplace/requests/:id/refund`

- Estorna solicitação concluída.
- Exige `verifyToken` e uma das permissões `marketplace.request.approve` ou `marketplace.refund`.
- Transiciona `completed` para `refunded`.
- Cria lançamento `refund`.
- Registra auditoria `marketplace.request.refunded`.

## Módulo `/dashboard`

### `GET /dashboard/summary/:dassOffice`

- Retorna resumo agregado da unidade.
- Não exige autenticação.
- Aceita `startDate` e `endDate` opcionais.
- Inclui métricas de ideias, pontuação, ledger e marketplace.

### `GET /dashboard/monthly/:dassOffice`

- Retorna série mensal de ideias e métricas relacionadas.
- Não exige autenticação.
- Aceita `startDate` e `endDate` opcionais.

### `GET /dashboard/dimensional/:dassOffice`

- Retorna agregações dimensionais da unidade.
- Não exige autenticação.
- Aceita `startDate` e `endDate` opcionais.

### `GET /dashboard/idea-highlights/:dassOffice`

- Retorna ideias em destaque da unidade.
- Não exige autenticação.
- Aceita `startDate` e `endDate` opcionais.
- Não usa likes ou comentários aleatórios como dado canônico.

### `GET /dashboard/engagement/:dassOffice`

- Retorna dados de engajamento dos colaboradores.
- Não exige autenticação.
- Aceita `startDate` e `endDate` opcionais.

## Módulo `/ai`

### `POST /ai/improve-text`

- Melhora o texto de antes/depois do cadastro de ideia usando Gemini.
- Não exige autenticação.
- Sanitiza caracteres de entrada sensíveis para o prompt.
- Rejeita prompts acima do limite de tokens configurado no service.
- Atua apenas como auxílio textual; não altera status, pontuação, autorização ou dados formais da ideia.

## Tratamento global de erro

O app possui middleware global que:

- usa `CustomError.statusCode` quando disponível;
- responde `500` nos demais casos;
- acrescenta `"Contate a equipe de automação!"` à mensagem;
- inclui `details` apenas quando `DEV_ENV === "development"`.
