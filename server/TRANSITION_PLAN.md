# Plano de Transição de Dados Pense&Aja

## Contexto atual em desenvolvimento

Em desenvolvimento, as migrations e comandos iniciais já foram executados:

- `npm run migrate:run`
- `npm run bootstrap:admin-master -- <matricula> <dassOffice>`
- `npm run backfill:ledger`

Também foram adicionados comandos idempotentes para concluir e validar a transição sem alterar as tabelas legadas:

- `npm run backfill:catalog`
- `npm run backfill:marketplace`
- `npm run rebuild:balance-projections`
- `npm run verify:transition`

O backend já usa o modelo novo para novos fluxos:

- Pontuação operacional: `points_ledger_entries` e `points_balance_projection`
- Catálogo operacional: `marketplace_catalog_items`
- Resgates operacionais: `marketplace_redemption_requests`
- Histórico/auditoria: `audit_events`

As tabelas legadas devem permanecer intactas:

- `pense_aja.pense_aja_dass`
- `pense_aja.pense_aja_pontos`
- `pense_aja.pense_aja_premios`
- `pense_aja.pense_aja_loja`

Observação: `pense_aja.pense_aja_dass` continua sendo a tabela operacional/canônica de registros de ideias. Não há script obrigatório para migrar ideias para uma tabela nova porque a proposta atual complementa pontuação, catálogo, marketplace, RBAC e auditoria sem substituir a tabela legada de ideias.

## Finalizar transição em desenvolvimento

### 1. Validar migrations

```sql
SELECT *
FROM migrations
ORDER BY timestamp DESC;
```

```sql
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'pense_aja'
  AND table_name IN (
    'rbac_users',
    'unit_configs',
    'unit_scoring_rules',
    'unit_workflow_steps',
    'unit_marketplace_policies',
    'marketplace_catalog_items',
    'marketplace_redemption_requests',
    'marketplace_fulfillment_steps',
    'marketplace_voucher_deliveries',
    'points_ledger_entries',
    'points_balance_projection',
    'audit_events'
  )
ORDER BY table_name;
```

```sql
SELECT table_name, column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'pense_aja'
  AND column_name = 'id'
  AND table_name IN (
    'rbac_users',
    'unit_configs',
    'unit_scoring_rules',
    'unit_workflow_steps',
    'unit_marketplace_policies',
    'marketplace_catalog_items',
    'marketplace_fulfillment_steps',
    'marketplace_voucher_deliveries'
  )
ORDER BY table_name;
```

Critério: tabelas novas com `data_type = uuid` e default `uuid_generate_v4()`.

### 2. Validar catálogo legado migrado

A migration inicial já tenta migrar `pense_aja_loja` para `marketplace_catalog_items`. Para garantir transição completa depois de ajustes, reexecuções ou bases parcialmente migradas, rode o backfill idempotente:

```bash
cd server
npm run backfill:catalog
```

```sql
SELECT unidade_dass, COUNT(*) AS total_legacy
FROM pense_aja.pense_aja_loja
GROUP BY unidade_dass
ORDER BY unidade_dass;
```

```sql
SELECT unidade_dass, COUNT(*) AS total_new
FROM pense_aja.marketplace_catalog_items
WHERE legacy_product_id IS NOT NULL
GROUP BY unidade_dass
ORDER BY unidade_dass;
```

```sql
SELECT legacy.id, legacy.unidade_dass, legacy.nome
FROM pense_aja.pense_aja_loja legacy
LEFT JOIN pense_aja.marketplace_catalog_items catalog
  ON catalog.legacy_product_id = legacy.id::text
WHERE catalog.id IS NULL
ORDER BY legacy.unidade_dass, legacy.nome;
```

```sql
SELECT legacy_product_id, COUNT(*) AS total
FROM pense_aja.marketplace_catalog_items
WHERE legacy_product_id IS NOT NULL
GROUP BY legacy_product_id
HAVING COUNT(*) > 1;
```

Critério: zero faltantes e zero duplicidades.

### 3. Validar backfill do ledger

```sql
SELECT
  legacy.unidade_dass,
  legacy.total_legacy_points,
  COALESCE(ledger.total_ledger_points, 0) AS total_ledger_points,
  legacy.total_legacy_points - COALESCE(ledger.total_ledger_points, 0) AS diff
FROM (
  SELECT unidade_dass, COALESCE(SUM(valor), 0) AS total_legacy_points
  FROM pense_aja.pense_aja_pontos
  GROUP BY unidade_dass
) legacy
LEFT JOIN (
  SELECT unidade_dass, COALESCE(SUM(amount), 0) AS total_ledger_points
  FROM pense_aja.points_ledger_entries
  WHERE entry_type = 'earn'
    AND source_type = 'legacy_points'
    AND status = 'confirmed'
  GROUP BY unidade_dass
) ledger ON ledger.unidade_dass = legacy.unidade_dass
ORDER BY legacy.unidade_dass;
```

```sql
SELECT
  legacy.unidade_dass,
  legacy.total_legacy_rewards,
  COALESCE(ledger.total_ledger_commits, 0) AS total_ledger_commits,
  legacy.total_legacy_rewards - COALESCE(ledger.total_ledger_commits, 0) AS diff
FROM (
  SELECT unidade_dass, COALESCE(SUM(pontos_premio_solicitado), 0) AS total_legacy_rewards
  FROM pense_aja.pense_aja_premios
  GROUP BY unidade_dass
) legacy
LEFT JOIN (
  SELECT unidade_dass, COALESCE(SUM(amount), 0) AS total_ledger_commits
  FROM pense_aja.points_ledger_entries
  WHERE entry_type = 'commit'
    AND source_type = 'legacy_reward'
    AND status = 'confirmed'
  GROUP BY unidade_dass
) ledger ON ledger.unidade_dass = legacy.unidade_dass
ORDER BY legacy.unidade_dass;
```

Critério: `diff = 0` por unidade.

### 4. Backfill de marketplace histórico

Executar:

```bash
cd server
npm run backfill:marketplace
```

O script cria `marketplace_redemption_requests` para prêmios legados ainda não migrados.

Validação:

```sql
SELECT reward.id, reward.unidade_dass, reward.matricula
FROM pense_aja.pense_aja_premios reward
LEFT JOIN pense_aja.marketplace_redemption_requests request
  ON request.legacy_prize_id = reward.id
WHERE request.id IS NULL;
```

```sql
SELECT legacy_prize_id, COUNT(*) AS total
FROM pense_aja.marketplace_redemption_requests
WHERE legacy_prize_id IS NOT NULL
GROUP BY legacy_prize_id
HAVING COUNT(*) > 1;
```

Critério: zero linhas.

### 5. Recalcular projeções de saldo

Executar:

```bash
cd server
npm run rebuild:balance-projections
```

Validação:

```sql
WITH ledger AS (
  SELECT
    matricula,
    unidade_dass,
    COALESCE(SUM(CASE WHEN entry_type = 'earn' THEN amount ELSE 0 END), 0) AS total_earned,
    COALESCE(SUM(CASE WHEN entry_type = 'reverse' THEN amount ELSE 0 END), 0) AS total_reversed,
    GREATEST(
      COALESCE(SUM(CASE WHEN entry_type = 'reserve' THEN amount ELSE 0 END), 0)
      - COALESCE(SUM(CASE WHEN entry_type = 'release' THEN amount ELSE 0 END), 0)
      - COALESCE(SUM(CASE WHEN entry_type = 'commit' THEN amount ELSE 0 END), 0),
      0
    ) AS total_reserved,
    COALESCE(SUM(CASE WHEN entry_type = 'commit' THEN amount ELSE 0 END), 0) AS total_committed,
    COALESCE(SUM(CASE WHEN entry_type = 'refund' THEN amount ELSE 0 END), 0) AS total_refunded
  FROM pense_aja.points_ledger_entries
  WHERE status = 'confirmed'
  GROUP BY matricula, unidade_dass
)
SELECT
  ledger.matricula,
  ledger.unidade_dass,
  ledger.total_earned,
  projection.total_earned AS projected_earned,
  ledger.total_reserved,
  projection.total_reserved AS projected_reserved,
  ledger.total_committed,
  projection.total_committed AS projected_committed,
  ledger.total_refunded,
  projection.total_refunded AS projected_refunded,
  (ledger.total_earned - ledger.total_reversed - ledger.total_reserved - ledger.total_committed + ledger.total_refunded) AS expected_available,
  projection.available_balance
FROM ledger
LEFT JOIN pense_aja.points_balance_projection projection
  ON projection.matricula = ledger.matricula
 AND projection.unidade_dass = ledger.unidade_dass
WHERE projection.id IS NULL
   OR projection.total_earned <> ledger.total_earned
   OR projection.total_reserved <> ledger.total_reserved
   OR projection.total_committed <> ledger.total_committed
   OR projection.total_refunded <> ledger.total_refunded
   OR projection.total_reversed <> ledger.total_reversed
   OR projection.available_balance <> (
      ledger.total_earned - ledger.total_reversed - ledger.total_reserved - ledger.total_committed + ledger.total_refunded
   );
```

Critério: zero linhas.

### 6. Testes de aplicação em desenvolvimento

```bash
cd server
npm run build
npm test
```

Validar manualmente:

- `GET /user/session-context/:dassOffice`
- `GET /marketplace/catalog/:dassOffice`
- `POST /marketplace/requests`
- `PUT /marketplace/requests/:id/approve`
- `PUT /marketplace/requests/:id/fulfillment`
- `PUT /marketplace/requests/:id/complete`
- `GET /user/:registration?dassOffice=<unidade>`
- `GET /user/:registration/points-history?dassOffice=<unidade>`

### 7. Verificação consolidada

Executar:

```bash
cd server
npm run verify:transition
```

O comando valida em uma única execução:

- Itens legados de loja sem `marketplace_catalog_items`.
- Duplicidades de catálogo por `legacy_product_id`.
- Pontos legados sem ledger.
- Prêmios legados sem ledger.
- Prêmios legados sem `marketplace_redemption_requests`.
- Duplicidades de marketplace por `legacy_prize_id`.
- Divergências entre ledger e `points_balance_projection`.

Critério: comando finaliza com exit code `0`.

### 8. Scripts existentes e lacunas

Scripts obrigatórios da transição:

- `npm run backfill:catalog`: migra/reconcilia `pense_aja_loja` para `marketplace_catalog_items`.
- `npm run backfill:ledger`: migra/reconcilia `pense_aja_pontos` e `pense_aja_premios` para `points_ledger_entries`.
- `npm run backfill:marketplace`: migra/reconcilia `pense_aja_premios` para `marketplace_redemption_requests`.
- `npm run rebuild:balance-projections`: recalcula `points_balance_projection` somente a partir do ledger.
- `npm run verify:transition`: valida consistência consolidada da transição.

Não há script obrigatório adicional para migrar registros de ideias porque `pense_aja_dass` permanece como fonte operacional. Se a decisão de produto for criar linha histórica em `audit_events` para ideias antigas, isso deve ser tratado como backfill opcional separado, por exemplo `backfill:idea-audit`, sem modificar os registros legados.

## Execução completa em produção

### 1. Backup e janela

```bash
pg_dump --format=custom --file=pense_aja_pre_migration.dump <DATABASE_URL>
```

Registrar contagens antes:

```sql
SELECT 'pense_aja_dass' AS tabela, COUNT(*) FROM pense_aja.pense_aja_dass
UNION ALL SELECT 'pense_aja_pontos', COUNT(*) FROM pense_aja.pense_aja_pontos
UNION ALL SELECT 'pense_aja_premios', COUNT(*) FROM pense_aja.pense_aja_premios
UNION ALL SELECT 'pense_aja_loja', COUNT(*) FROM pense_aja.pense_aja_loja
UNION ALL SELECT 'points_ledger_entries', COUNT(*) FROM pense_aja.points_ledger_entries
UNION ALL SELECT 'marketplace_catalog_items', COUNT(*) FROM pense_aja.marketplace_catalog_items
UNION ALL SELECT 'marketplace_redemption_requests', COUNT(*) FROM pense_aja.marketplace_redemption_requests;
```

### 2. Aplicar código e migrations

```bash
cd server
npm ci
npm run build
npm run migrate:run
```

Criar admin por unidade quando necessário:

```bash
npm run bootstrap:admin-master -- <matricula_admin> <dassOffice>
```

### 3. Executar backfills

```bash
npm run backfill:catalog
npm run backfill:ledger
npm run backfill:marketplace
npm run rebuild:balance-projections
npm run verify:transition
```

### 4. Validar produção

Executar todas as queries de validação da etapa de desenvolvimento e confirmar que `npm run verify:transition` terminou com exit code `0`.

Critérios de liberação:

- Zero prêmios legados sem `marketplace_redemption_requests`.
- Zero pontos/prêmios legados sem ledger.
- Zero divergências em `points_balance_projection`.
- Zero duplicidades por `legacy_product_id` e `legacy_prize_id`.
- Build e testes passaram.
- Testes manuais de API passaram com ao menos uma matrícula real por unidade.

### 5. Monitoramento pós-liberação

```sql
SELECT entry_type, source_type, COUNT(*), SUM(amount)
FROM pense_aja.points_ledger_entries
GROUP BY entry_type, source_type
ORDER BY entry_type, source_type;
```

```sql
SELECT request_status, COUNT(*)
FROM pense_aja.marketplace_redemption_requests
GROUP BY request_status
ORDER BY request_status;
```

```sql
SELECT unidade_dass, COUNT(*), SUM(available_balance)
FROM pense_aja.points_balance_projection
GROUP BY unidade_dass
ORDER BY unidade_dass;
```

## Regra de segurança

Não apagar, truncar ou alterar dados legados durante a transição. O legado é fonte histórica e mecanismo de reconciliação.
