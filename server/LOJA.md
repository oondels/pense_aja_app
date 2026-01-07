# Mudaças loja

## Carteira

```sql
CREATE TABLE pense_aja.pense_aja_wallet (
id uuid DEFAULT gen_random_uuid() NOT NULL,
matricula int8 NOT NULL,
saldo numeric(10, 2) DEFAULT 0.00 NOT NULL,
"version" int4 DEFAULT 1 NOT NULL,
last_transaction_at timestamptz NULL,
is_frozen bool DEFAULT false NULL,
created_at timestamptz DEFAULT now() NOT NULL,
updated_at timestamptz DEFAULT now() NOT NULL,
CONSTRAINT pense_aja_wallet_matricula_key UNIQUE (matricula),
CONSTRAINT pense_aja_wallet_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_wallet_matricula ON pense_aja.pense_aja_wallet USING btree (matricula);
```

## Historico Carteira

```sql
CREATE TABLE pense_aja.pense_aja_wallet_ledger (
id uuid DEFAULT gen_random_uuid() NOT NULL,
wallet_id uuid NOT NULL,
amount numeric(10, 2) NOT NULL,
balance_after numeric(10, 2) NOT NULL,
operation_type varchar(50) NOT NULL,
reference_id varchar(100) NULL,
description text NULL,
created_at timestamptz DEFAULT now() NOT NULL,
created_by_user varchar(100) NULL,
CONSTRAINT pense_aja_wallet_ledger_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_ledger_wallet_created ON pense_aja.pense_aja_wallet_ledger USING btree (wallet_id, created_at DESC);

ALTER TABLE pense_aja.pense_aja_wallet_ledger ADD CONSTRAINT pense_aja_wallet_ledger_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES pense_aja.pense_aja_wallet(id);
```

## Pedidos

```sql
CREATE TABLE pense_aja.pense_aja_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- QUEM PEDIU
    matricula INT8 NOT NULL,
    
    -- VALORES TOTAIS
    total_points INT4 NOT NULL, -- Soma de todos os itens
    
    -- FLUXO DE ATENDIMENTO
    status VARCHAR(20) NOT NULL DEFAULT 'created' 
        CHECK (status IN ('created', 'accepted', 'rejected', 'in_preparation', 'done', 'delivered')),
    
    attended_by INT8 REFERENCES autenticacao.usuarios(matricula),
    rejected_reason TEXT, -- Se for rejeitado, saber o motivo
    
    -- SEGURANÇA E CONTROLE
    idempotency_key VARCHAR(255) UNIQUE, -- Evita duplicidade de pedido na rede
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index para o Backoffice filtrar rápido
CREATE INDEX idx_orders_status ON pense_aja.pense_aja_orders(status);
CREATE INDEX idx_orders_matricula ON pense_aja.pense_aja_orders(matricula);
```

### Pedidos (detalhe items)

```sql
CREATE TABLE pense_aja.pense_aja_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES pense_aja.pense_aja_orders(id) ON DELETE CASCADE,
    
    -- REFERÊNCIA FLEXÍVEL
    product_id UUID NOT NULL REFERENCES pense_aja.pense_aja_loja(id), 
    
    -- SNAPSHOT DE DADOS (Imutabilidade Histórica)
    product_name VARCHAR(255) NOT NULL, -- Copia o nome no momento da compra
    points_unit_value INT4 NOT NULL,    -- Copia o valor no momento da compra
    quantity INT4 NOT NULL DEFAULT 1,
    
    total_points INT4 GENERATED ALWAYS AS (points_unit_value * quantity) STORED -- Cálculo automático
);
```
