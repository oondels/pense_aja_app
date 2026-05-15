# Backend Business Rules

Este documento descreve as regras de negócio atuais do backend Pense Aja.
Ele deve ser usado como referência operacional para cadastro de ideias,
avaliação, pontuação, marketplace, notificações, RBAC e dashboards.

## Contexto de Negócio

O Pense Aja é uma plataforma de inovação aberta usada para transformar ideias
em ação operacional. O backend é a fonte de verdade para:

- validade do contexto organizacional;
- autorização por unidade Dass;
- integridade da avaliação;
- rastreabilidade da pontuação;
- consistência de resgates;
- projeções de dashboard e perfil;
- disparos de notificação como efeitos colaterais não bloqueantes.

## Atores de Domínio

### Colaborador

- cadastra ideias;
- acompanha avaliações e histórico;
- consulta saldo e classificações;
- solicita resgates quando possui pontuação disponível.

### Avaliador

- avalia ideias conforme permissões efetivas da sessão;
- registra status, classificação, justificativa e atributos operacionais;
- atua no slot de avaliação resolvido pelo workflow da unidade.

### Operador de Marketplace

- aprova ou rejeita solicitações de resgate;
- realiza estornos quando permitido;
- opera separação, entrega ou voucher apenas quando houver fluxo específico conectado.

### Administrador

- gerencia permissões RBAC;
- mantém catálogo da loja;
- configura vínculos usuário/unidade/papel.

## Princípios Obrigatórios

- Decisões críticas não dependem apenas da UI.
- Autorização, saldo, estado de resgate e histórico são definidos no backend.
- Toda regra sensível é resolvida no contexto de uma unidade Dass.
- Pontos são registrados em ledger append-only.
- Correções de pontuação usam contralançamentos, não remoção de histórico.
- Escritas relevantes de ideias, catálogo, marketplace e ledger geram trilha auditável.
- Falhas de notificação não invalidam a transação principal.

## Unidades Válidas

O backend valida explicitamente as unidades:

- `SEST`
- `VDC`
- `ITB`
- `VDC-CONF`
- `STJ`

Permissões, pontuação, workflow e marketplace são sempre avaliados dentro do
escopo da unidade.

## Cadastro de Ideia

- O cadastro é a origem do ciclo operacional da ideia.
- A submissão de ideias é pública e não depende de sessão autenticada.
- A unidade vinculada ao registro define o escopo funcional do cadastro.
- O backend valida campos essenciais, unidade e duplicidade.
- As oito perdas lean são convertidas para colunas binárias.
- Ganhos são gravados como estrutura JSON.
- A duplicidade é controlada por lock transacional e busca por matrícula,
  projeto, data realizada e unidade.
- Quando a duplicidade é detectada, o backend retorna a ideia existente sem
  criar novo registro.
- Novos cadastros registram auditoria `idea.created`.
- Após o commit, o backend dispara evento interno de notificação `idea.created`.
- Busca de gerente, opt-in e envio de notificação são efeitos colaterais não
  bloqueantes.

## Avaliação

- A avaliação transforma uma ideia cadastrada em decisão operacional.
- A rota exige token e permissão `idea.evaluate`.
- O service resolve a etapa ativa em `unit_workflow_steps` para a unidade.
- Quando não há workflow configurado, aplica fallback compatível:
  `analyst_review` para avaliação comum e `manager_review` para atuação gerencial.
- O slot de avaliação vem de `metadata.reviewSlot`, do `step_code` ou da ordem
  da etapa.
- Usuários sem a permissão exigida pela etapa não podem avaliar.
- Exclusão exige permissão adicional `idea.exclude`.
- Reprovação não pode coexistir com classificação.
- Avaliação comum grava campos de analista.
- Atuação gerencial grava campos de gerente.
- Status `exclude` marca a ideia como excluída.
- Status `reprove` reprova sem gerar nova pontuação.
- Demais status podem atualizar `classificacao`, `a3_mae`, `em_espera` e
  `replicavel`.
- Cada avaliação registra auditoria `idea.evaluated` com estado anterior,
  estado posterior, status, classificação, slot e etapa de workflow.
- Após o commit, o backend dispara evento interno de notificação `idea.evaluated`.

## RBAC por Unidade

- JWT representa identidade e sessão.
- Permissões de negócio são resolvidas por RBAC no contexto da unidade.
- A mesma matrícula pode ter múltiplos papéis ativos na mesma unidade e papéis diferentes em unidades diferentes.
- `admin_master` ativo em qualquer unidade tem escopo administrativo global.
- `unit_admin` gerencia apenas papéis abaixo dele dentro de sua unidade.
- `idea_admin` gerencia apenas `idea_submitter` dentro de sua unidade.
- `marketplace_admin` gerencia apenas `marketplace_operator` dentro de sua unidade.
- Operações de RBAC validam a hierarquia no backend para listar, criar, editar e remover vínculos.
- Rotas sensíveis usam permissões atômicas como:
  - `idea.view`
  - `idea.evaluate`
  - `idea.exclude`
  - `catalog.manage`
  - `marketplace.request.approve`
  - `marketplace.refund`
  - `rbac.manage`
  - `reward.legacy.redeem` _(fluxo legado: `PUT /pense-aja/purchase/:registration`)_
- `idea.submit` pode existir no modelo RBAC por compatibilidade, mas o cadastro
  público de ideias não exige essa permissão.
- `marketplace.request.create` pode existir no modelo RBAC por compatibilidade,
  mas a criação de solicitação de resgate exige apenas usuário autenticado.
- O backend resolve papéis e permissões agregados a cada request autenticado, sem snapshot persistido.
- `funcao` permanece no JWT e em dados de perfil como atributo legado de
  identidade, não como fonte autorizadora principal.

## Ledger de Pontuação

- `points_ledger_entries` é a fonte auditável da movimentação de pontos.
- `pense_aja.pense_aja_pontos` permanece apenas como histórico/backfill.
- Lançamentos são append-only e possuem origem rastreável.
- Tipos usados:
  - `earn`
  - `reverse`
  - `reserve`
  - `commit`
  - `release`
  - `refund`
- Avaliação elegível gera `earn`.
- Reavaliação, reprovação ou exclusão geram `reverse` quando há saldo líquido
  associado à ideia.
- Solicitação de resgate gera `reserve`.
- Aprovação ou conclusão de resgate gera `commit`.
- Rejeição ou cancelamento elegível gera `release`.
- Estorno posterior gera `refund`.
- Reversões e transições relacionadas referenciam lançamento anterior quando
  aplicável.

## Pontuação e Saldo

- Pontuação de avaliação usa `unit_scoring_rules` ativa por unidade e
  classificação.
- Classificações são letras canônicas configuráveis por unidade (`A`, `B`,
  `C`, `D`...), com rótulo, descrição, ordem e pontuação definidos no banco.
- Compatibilidade temporária converte entradas legadas `3/2/1` para `A/B/C`.
- Quando não há regra ativa e vigente para a classificação enviada, a
  avaliação retorna `400` e não grava pontuação.
- Avaliações aprovadas podem receber bonificação extra por `bonusPoints`.
- Bonificação exige justificativa própria, usa `source_type =
  idea_evaluation_bonus` e é limitada por
  `unit_configs.metadata.maxEvaluationBonusPoints` da unidade, com padrão `2`.
- Em reavaliação, a bonificação anterior é revertida e substituída quando o
  novo valor for diferente; reprovação e exclusão revertem a bonificação ativa.
- Ajustes manuais de pontuação usam `source_type = manual_adjustment`, exigem
  permissão `points.adjust` e justificativa obrigatória.
- Ajuste manual de débito é bloqueado se deixaria `available_balance` negativo.
- O saldo funcional é mantido em `points_balance_projection`.
- O saldo disponível é calculado a partir de ganhos, reversões, consumos,
  reservas ativas e estornos.
- Reservas ativas não podem ficar negativas.
- Resgates legados migrados como `commit` sem reserva anterior reduzem saldo
  disponível como consumo confirmado.
- Frontend e dashboard devem consumir projeções consolidadas do backend, não
  recalcular saldo por heurística local.

## Marketplace e Resgates

- Catálogo operacional usa `marketplace_catalog_items`.
- Catálogo é segregado por unidade.
- Solicitação de resgate usa `marketplace_redemption_requests`.
- `pense_aja.pense_aja_premios` permanece como histórico/backfill.
- Antes de validar saldo, o backend sincroniza `points_balance_projection` e
  bloqueia o registro com `FOR UPDATE`.
- Qualquer usuário autenticado pode criar solicitação de resgate para a própria
  matrícula; `marketplace.request.create` não é exigida nesse fluxo.
- A criação de solicitação ignora matrícula enviada no corpo e usa a matrícula
  do token autenticado.
- Solicitação valida item ativo, disponibilidade e saldo disponível.
- Solicitação cria `reserve` e entra como `pending_approval`.
- Aprovação exige `marketplace.request.approve`, cria `commit` e conclui a
  solicitação como `completed`.
- Rejeição exige `marketplace.request.approve`, cria `release` e marca
  `rejected`.
- Estorno exige `marketplace.request.approve` ou `marketplace.refund`, cria
  `refund` e marca `refunded`.
- Listagem administrativa de solicitações aceita filtros por status e matrícula
  e retorna paginação.
- Consulta própria exige token e sempre usa a matrícula autenticada.
- Consulta pública permite leitura por unidade e matrícula, sem permitir
  transições de status.
- O endpoint legado de compra direta cria `reserve`, `commit` e uma solicitação
  já concluída para preservar compatibilidade.
- O fluxo público atual não executa voucher, separação ou fulfillment no Pense Aja.

## Auditoria

Eventos operacionais atuais incluem:

- `idea.created`
- `idea.evaluated`
- `catalog.item.created`
- `catalog.item.updated`
- `marketplace.request.created`
- `marketplace.request.approved`
- `marketplace.request.rejected`
- `marketplace.request.completed`
- `marketplace.request.refunded`
- `points.adjusted`

Cada evento registra, quando aplicável:

- tipo de evento;
- entidade e id correlacionado;
- unidade;
- ator;
- motivo ou justificativa;
- estado anterior;
- estado posterior;
- metadata;
- `correlationId`;
- timestamp.

Auditoria não substitui a tabela operacional; ela registra histórico de decisão
e mutação relevante.

## Usuário e Notificações

- Email corporativo deve usar domínio `@grupodass.com.br`.
- Opt-in de notificação usa `authorized_notifications_apps`.
- Lista vazia mantém compatibilidade com fallback legado `["null"]`.
- Notificação de cadastro nasce do evento interno `idea.created`.
- Notificação de avaliação nasce do evento interno `idea.evaluated`.
- Busca de email, opt-in e envio são pós-processamento não bloqueante.
- Falhas de integração de notificação são registradas em log e não mudam a
  resposta da operação principal.

## Dashboard e Analytics

- Dashboard é projeção de leitura do domínio.
- Dashboard não cria regra de negócio nova.
- Ideia implementada no dashboard é uma ideia fora de espera (`em_espera != '1'`)
  com aprovação de analista ou gerente.
- Indicadores de pontuação e resgate derivam de ledger e marketplace.
- Destaques de ideias não devem tratar dados sintéticos como métrica canônica.
- Métricas devem refletir estados consolidados do backend.

## IA

- IA é assistiva.
- IA melhora textos de antes/depois do cadastro.
- IA não substitui autorização, avaliação formal, ledger, auditoria ou decisão
  operacional.

## Limitações Conhecidas

- Vocabulário de status ainda não está totalmente normalizado.
- Rotas públicas de leitura ainda dependem da política final de exposição.
- Permissões dependem de vínculos RBAC populados corretamente por unidade.
- Integração real de voucher depende de provider externo conectado ao adapter.
- Fulfillment físico/voucher possui tabelas e service auxiliar, mas não faz
  parte do fluxo público atual simplificado.

## Resumo Operacional

1. Ideia válida nasce em uma unidade válida.
2. A ideia evolui por ações autorizadas no backend.
3. A avaliação usa workflow configurável por unidade com fallback compatível.
4. Cada decisão relevante deixa trilha auditável.
5. Cada ponto gerado ou consumido possui lastro em ledger.
6. Cada resgate respeita reserva, validação de saldo, aprovação e reconciliação.
7. Frontend, dashboard e notificações consomem estados consolidados do backend.
