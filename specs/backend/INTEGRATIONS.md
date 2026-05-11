# Backend Integrations

## Variáveis de ambiente atuais

Carregadas por `server/src/config/dotenv.ts`:

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

## PostgreSQL

### Papel no sistema

- fonte primária de dados do produto
- persistência de ideias, usuários, catálogo, pontos e resgates no estado atual
- destino da futura modelagem de RBAC, ledger, auditoria e marketplace

### Camada de acesso

- `server/src/config/database.ts` define o `AppDataSource`
- entidades TypeORM ficam em `server/src/models/`
- `synchronize = false`
- transações de escrita usam `QueryRunner`

### Estruturas atuais relevantes

- `pense_aja.pense_aja_dass`
- `pense_aja.points_ledger_entries`
- `pense_aja.points_balance_projection`
- `pense_aja.marketplace_catalog_items`
- `pense_aja.marketplace_redemption_requests`
- `pense_aja.marketplace_fulfillment_steps`
- `pense_aja.marketplace_voucher_deliveries`
- `pense_aja.audit_events`
- `pense_aja.rbac_*`
- `autenticacao.usuarios`
- `autenticacao.emails`
- `core.unidades_dass`
- `colaborador.lista_funcionario[_UNIDADE]`

Estruturas legadas preservadas apenas para histórico/backfill:

- `pense_aja.pense_aja_pontos`
- `pense_aja.pense_aja_premios`
- `pense_aja.pense_aja_loja`

### Evolução documentada

O banco deve passar a acomodar:

- RBAC normalizado por unidade
- ledger append-only de pontuação
- projeção de saldo
- histórico de auditoria por evento
- workflow de marketplace
- configuração versionada por unidade

## Redis

### Papel atual

- verificar blacklist de token JWT

### Regra atual

- se existir `bl_<token>`, a request autenticada é negada

### Evolução documentada

- Redis pode apoiar cache curto de snapshot de permissões por sessão
- esse snapshot não substitui o backend como fonte de verdade autorizadora

## RabbitMQ

### Papel atual

- worker `uploadListener.ts`
- fila principal `pense_aja`
- retry e DLQ para processos assíncronos

### Regras atuais

- retry com TTL de 15 segundos
- máximo de 3 tentativas
- hoje o `processType` suportado explicitamente é `product`

### Evolução documentada

- o barramento pode ser expandido para eventos de marketplace, emissão de voucher e tarefas assíncronas de notificação
- eventos assíncronos não devem ser usados para substituir a consistência transacional do ledger

## Serviço externo de autenticação

O backend não implementa login. O serviço externo continua responsável por:

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/token/refresh`

Regra operacional atual:

- `JWT_SECRET` é obrigatório no boot do backend
- a API não deve iniciar com segredo padrão ou ausente

No modelo-alvo:

- JWT continua representando identidade e sessão
- autorização de negócio passa a ser resolvida pelo backend do Pense&Aja
- permissões por sessão podem ser cacheadas com TTL e versão

## Serviço externo de notificação

### Endpoint atual

- `POST ${NOTIFICATION_API}/notification/`

### Header obrigatório

- `x-api-key: ${NOTIFICATION_API_KEY}`

### Uso atual

- avisar gerente sobre novo cadastro
- avisar colaborador sobre avaliação

### Direção

- eventos de pontuação e de resgate devem poder disparar notificações futuras
- falha no envio continua não devendo derrubar a transação principal do domínio

## Gemini

### Modelo atual

- `gemini-1.5-flash`

### Uso

- melhoria de texto do cadastro
- sumarização interna da service

### Regra

- IA é apoio de UX e produtividade
- não participa da fonte de verdade de autorização, classificação, ledger ou marketplace

## Integrações futuras do marketplace

O modelo-alvo admite provedores externos para voucher ou fulfillment digital. Quando isso for implementado, as integrações devem obedecer a estas regras:

- o backend inicia o fluxo com reserva transacional de saldo
- a confirmação externa nunca substitui o lançamento de ledger
- falha operacional deve resultar em `release` ou `refund`, conforme o estágio do processo
- integração externa deve gerar evento auditável correlacionado ao resgate

## Deploy e operação

### Backend container

- build TypeScript para `dist/`
- runtime Node exposto em `2512`
- usa `.env.production`

### Frontend container

- build Vite
- entrega estática via Nginx na porta `5050`

## Riscos operacionais atuais

- RabbitMQ e Redis ainda impactam o boot sem estratégia madura de degradação
- o auth externo está fora deste repositório
- o modelo atual ainda mistura persistência operacional com agregados de leitura
