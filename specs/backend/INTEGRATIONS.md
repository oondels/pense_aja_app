# Backend Integrations

## Environment variables usadas

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

### Uso

- fonte primária de dados do produto
- leitura e escrita de ideias, pontos, prêmios, usuários e notificações

### Camada de acesso

- `server/src/config/database.ts` define o `AppDataSource` do TypeORM
- entidades ficam em `server/src/models/`
- `synchronize` permanece `false`; o schema continua sendo a fonte de verdade
- transações de escrita usam `QueryRunner` para fluxos como cadastro, avaliação, resgate e manutenção de loja

### Tabelas/schema referenciados

- `pense_aja.pense_aja_dass`
- `pense_aja.pense_aja_pontos`
- `pense_aja.pense_aja_premios`
- `pense_aja.pense_aja_loja`
- `colaborador.lista_funcionario`
- `colaborador.lista_funcionario_VDC`
- `colaborador.lista_funcionario_ITB`
- `colaborador.lista_funcionario_VDC-CONF`
- `colaborador.lista_funcionario_STJ`
- `autenticacao.usuarios`
- `autenticacao.emails`
- `core.unidades_dass`

### Observações de modelagem

- as tabelas `pense_aja.*`, `autenticacao.usuarios`, `autenticacao.emails` e `core.unidades_dass` possuem entidades TypeORM registradas
- as views/tabelas `colaborador.lista_funcionario[_UNIDADE]` continuam consultadas por nome qualificado, pois variam por unidade

## Redis

### Uso

- verificar blacklist de token JWT

### Regra

- se existir `bl_<token>`, a request autenticada é negada

## RabbitMQ

### Worker

`server/src/workers/uploadListener.ts`

### Filas e exchanges

- fila principal: `pense_aja`
- fila de retry: `pense_aja.retry`
- exchange DLX: `pense_aja.dlx`
- fila final de falha: `pense_aja.dlq`

### Regras operacionais

- retry com TTL de 15 segundos
- máximo de 3 tentativas
- mensagens inválidas seguem para DLQ
- hoje o `processType` suportado explicitamente é `product`

## Serviço externo de autenticação

O backend não implementa login. O frontend fala com um serviço separado na porta `2399` para:

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/token/refresh`

O backend atual apenas consome o cookie JWT emitido por esse serviço.

## Serviço externo de notificação

### Endpoint

- `POST ${NOTIFICATION_API}/notification/`

### Header obrigatório

- `x-api-key: ${NOTIFICATION_API_KEY}`

### Uso

- avisar gerente sobre novo cadastro
- avisar colaborador sobre avaliação

Falhas no disparo são logadas, mas não derrubam o fluxo principal.

## Gemini

### Modelo atual

- `gemini-1.5-flash`

### Uso

- melhorar texto do cadastro
- resumir texto internamente na service

### Regras

- se `GEMINI_API_KEY` não existir, a inicialização da service lança erro
- a entrada é sanitizada antes do prompt

## Deploy atual

### Backend container

- build TypeScript para `dist/`
- runtime Node exposto em `2512`
- usa `.env.production` no container

### Frontend container

- build Vite
- entrega estática via Nginx na porta `5050`

## Observações operacionais

- o backend inicia o consumidor RabbitMQ no bootstrap da API
- se RabbitMQ estiver indisponível no startup, isso impacta a inicialização do processo
- Redis também tenta conectar no boot, fora de uma estratégia explícita de retry controlado
