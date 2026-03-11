# Backend Lookup

Este arquivo é a porta de entrada do backend para leitura humana e lookup por code agents. Use os módulos abaixo para encontrar rapidamente a fonte de verdade mais barata em tokens: primeiro as specs, depois os arquivos-fonte quando necessário.

## Backend Overview
- Keywords: backend, api, express, typescript, pense aja, arquitetura, visão geral
- File: `specs/backend/ROUTES.md`, `specs/backend/BUSINESS_RULES.md`, `specs/backend/INTEGRATIONS.md`
- Related: bootstrap, módulos HTTP, rotas, controllers, services, contratos tipados, infraestrutura

## Shared Contracts
- Keywords: contracts, dto, interfaces, tipagem, types, frontend integration
- File: `server/src/types/contracts/`
- Related: controllers, services, payloads, responses, integração frontend

## Application Entry Point
- Keywords: bootstrap, app, express, cors, cookies, error handler, startup
- File: `server/src/penseAja.ts`
- Related: middleware global, rotas, worker RabbitMQ, tratamento de erro

## Idea Management API
- Keywords: pense aja, ideias, cadastro, listagem, detalhe, avaliação, loja, produtos, compra
- File: `specs/backend/ROUTES.md`, `server/src/routes/penseAja.route.ts`, `server/src/controllers/pense-aja.controller.ts`
- Related: pontuação, notificações, unidade dass, duplicidade, store, service layer

## Idea Business Rules
- Keywords: regras de negócio, avaliação, classificação, pontos, duplicidade, exclusão, reprovação
- File: `specs/backend/BUSINESS_RULES.md` e `server/src/services/pense-aja.service.ts`
- Related: gerente, analista, admin, loja, status, a3, replicável

## User Profile API
- Keywords: user, usuário, perfil, matrícula, unidade, email, notificações, preferências
- File: `specs/backend/ROUTES.md`, `server/src/routes/userPensAaja.route.ts`, `server/src/controllers/user-penseaja.controller.ts`
- Related: colaborador, autenticacao.emails, core.unidades_dass

## User Data Service
- Keywords: user service, pontos, classificações, gerente, email, office lookup
- File: `server/src/services/user-penseaja.service.ts`
- Related: perfil, notificações, pontuação, unidade dass

## Dashboard and Analytics
- Keywords: dashboard, analytics, métricas, resumo, mensal, dimensional, destaques, engajamento
- File: `specs/backend/ROUTES.md`, `server/src/controllers/dashboard.controller.ts` e `server/src/services/dashboard.service.ts`
- Related: relatórios, agregações, ranking, highlights, engagement

## AI Tools
- Keywords: ia, ai, gemini, improve text, resumo, prompt, texto
- File: `server/src/routes/aiTools.route.ts`, `server/src/controllers/ai-tools.controller.ts` e `server/src/services/ai.service.ts`
- Related: cadastro de ideia, sanitização, limite de tokens

## Authentication
- Keywords: auth, token, jwt, cookie, session, blacklist, refresh, autenticação
- File: `server/src/middlewares/auth.ts`
- Related: redis, serviço externo de autenticação, cookies, req.user

## Authorization
- Keywords: authorization, role, permissões, analista, gerente, automacao, autorização
- File: `server/src/middlewares/roleVerificationMiddleware.ts`
- Related: avaliação, atualização de produtos, compra de prêmio

## Notifications
- Keywords: notification, email, aviso, envio, api key, opt-in
- File: `server/src/services/notification.service.ts`
- Related: cadastro de ideia, avaliação, authorized_notifications_apps

## Database Access
- Keywords: postgres, pool, query, banco, persistência, schemas, database
- File: `server/src/config/database.ts`, `server/src/models/` e `specs/backend/INTEGRATIONS.md`
- Related: TypeORM DataSource, pense_aja_dass, pense_aja_pontos, pense_aja_premios, loja

## Redis Token Blacklist
- Keywords: redis, blacklist, token blacklist, sessão, segurança
- File: `server/src/config/redisClient.ts` e `server/src/services/token-blacklist.service.ts`
- Related: auth middleware, revoke token, cookies

## Async Upload Worker
- Keywords: rabbitmq, queue, worker, upload, retry, dlq, product
- File: `server/src/workers/uploadListener.ts` e `specs/backend/INTEGRATIONS.md`
- Related: loja, processamento assíncrono, dead letter, retry

## Errors and Logging
- Keywords: custom error, logger, winston, erro, logs, observabilidade
- File: `server/src/types/CustomError.ts`, `server/src/utils/logger.ts`, `server/src/penseAja.ts`
- Related: statusCode, details, middleware global

## Environment and Infra
- Keywords: env, dotenv, deploy, docker, container, runtime, ports, infraestrutura
- File: `specs/backend/INTEGRATIONS.md`, `server/src/config/dotenv.ts`, `server/Dockerfile`, `server/docker-compose.yml`
- Related: postgres, redis, rabbitmq, gemini, notification api

## Units and Tenant Rules
- Keywords: dassOffice, tenant, unidade, sest, vdc, itb, stj
- File: `specs/backend/BUSINESS_RULES.md` e busca por `checkDassOffice` em `server/src/services/`
- Related: validação de rota, escopo de dados, schemas por unidade

## Suggested Reading Order
- Keywords: onboarding, leitura, lookup, descoberta, navegação
- File: começar por `specs/backend/ROUTES.md`; depois `specs/backend/BUSINESS_RULES.md`; por fim `specs/backend/INTEGRATIONS.md`
- Related: debugging, manutenção, implementação de feature, revisão
