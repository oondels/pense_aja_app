# Frontend Lookup

Este arquivo é a porta de entrada do frontend para leitura humana e lookup por code agents. Use primeiro as specs desta pasta e só depois aprofunde nos componentes e serviços do código-fonte.

## Frontend Overview
- Keywords: frontend, vue, vite, pinia, vuetify, pwa, arquitetura, visão geral
- File: `specs/frontend/ARCHITECTURE.md`, `specs/frontend/ROUTES.md`, `specs/frontend/BUSINESS_RULES.md`, `specs/frontend/INTEGRATIONS.md`
- Related: estado, navegação, serviços, componentes

## App Bootstrap
- Keywords: bootstrap, main, app, vue app, pinia, vuetify, router, service worker
- File: `cliente/src/main.js` e `cliente/src/App.vue`
- Related: layout global, maintenance mode, navbar, footer

## Router
- Keywords: router, rotas, navegação, route map, views
- File: `cliente/src/router/index.js` e `specs/frontend/ROUTES.md`
- Related: lazy loading, páginas, navegação principal

## Layout and Navigation
- Keywords: navbar, home header, footer, mobile nav, layout, header, bottom navigation
- File: `cliente/src/components/Navbar.vue`, `cliente/src/components/HomeHeader.vue`, `cliente/src/components/Footer.vue`
- Related: login, store, register, links principais

## Session and User Store
- Keywords: session, storage, pinia, user store, sessionStorage, localStorage, unidadeDass, permission context
- File: `cliente/src/stores/userStore.js` e `specs/frontend/ARCHITECTURE.md`
- Related: auth, perfil, permissões, unidade, sessão

## Authentication UI
- Keywords: auth, login, logout, popup, sessão, usuário, autenticação
- File: `cliente/src/components/Auth/Login.vue`, `cliente/src/services/authService.js`
- Related: token refresh, profile, notification popup

## API Clients and Interceptors
- Keywords: axios, api client, interceptor, refresh token, 401, cookie, credentials
- File: `cliente/src/services/httpClient.js`, `cliente/src/interceptors/apiInterceptor.js`
- Related: auth service, backend api, retry, session expiration

## Unit Detection
- Keywords: unidade, dassOffice, matrícula, onboarding, localStorage, tenant
- File: `cliente/src/components/GetUserOffice.vue`
- Related: user profile, idea list, API scoping

## Email Prompt and Notifications
- Keywords: email, notificações, opt-in, popup, grupodass, news
- File: `cliente/src/components/GetUserEmail.vue`, `cliente/src/views/UserPage.vue`
- Related: auth service externa, perfil, news page

## Home Route
- Keywords: home, landing page, marketing, entrada
- File: `cliente/src/views/Home.vue`
- Related: home header, navegação para pense-aja

## Idea Listing
- Keywords: pense aja, listagem, filtros, busca, badge, status, lista
- File: `cliente/src/views/PenseAja.vue`, `cliente/src/components/ListaPenseAja.vue`
- Related: cadastro, detalhe, avaliação, filtros

## Idea Registration
- Keywords: cadastro, register, idea form, perdas, ganhos, confetti, melhoria
- File: `cliente/src/components/RegisterPenseAja.vue`, `cliente/src/services/penseAjaService.js`
- Related: user data, unidade, ai improve text, validações

## Idea Detail and Evaluation
- Keywords: detalhe, avaliação, status, classificacao, workflow, permissões, justificativa
- File: `cliente/src/views/ItemPenseAja.vue`, `cliente/src/services/evaluatePenseAjaService.js`
- Related: permissões, status mapping, notificações

## Dashboard and Reporting
- Keywords: dashboard, métricas, analytics, resumo, mensal, dimensional, engajamento, xlsx
- File: `cliente/src/views/Dashboard.vue`, `cliente/src/services/dashboardService.js`, `cliente/src/services/reportService.js`
- Related: composables, charts, exportação, filtros por período

## Dashboard Composables
- Keywords: composables, summary, monthly, ideas, engagement, dimensional, fallback
- File: `cliente/src/composables/`
- Related: dashboard service, error fallback, loading state

## User Profile
- Keywords: profile, user page, pontuação, saldo, ledger, classificações, email, notificações, preferências
- File: `cliente/src/views/UserPage.vue`, `cliente/src/services/userService.js`
- Related: auth, session store, notification opt-in

## Store and Rewards
- Keywords: loja, store, products, rewards, resgate, compra, prêmio, marketplace
- File: `cliente/src/components/Store/`, `cliente/src/services/storeService.js`
- Related: permissões, pontuação, backend store

## AI Tools
- Keywords: ai, ia, improve text, microphone, gemini, texto
- File: `cliente/src/services/aiService.js`, `cliente/src/components/AiTools/AiMicrofone.vue`
- Related: cadastro de ideia, backend ai

## PWA Install
- Keywords: pwa, install, beforeinstallprompt, app install, download app
- File: `cliente/src/components/PwaDownload.vue`, `cliente/src/composables/usePwaInstall.js`
- Related: service worker, mobile experience

## News and Product Announcements
- Keywords: news, novidades, onboarding, balloon, first-run
- File: `cliente/src/views/News.vue`
- Related: localStorage, email popup, rollout communication

## Frontend Business Rules
- Keywords: regras de negócio, validação, status, permissões, ledger, marketplace, fallback, storage
- File: `specs/frontend/BUSINESS_RULES.md`
- Related: rotas, services, profile, dashboard

## Frontend Integrations
- Keywords: integration, backend, auth api, notification, upload, vite api url, permission context
- File: `specs/frontend/INTEGRATIONS.md`
- Related: httpClient, interceptors, env, Docker

## Suggested Reading Order
- Keywords: onboarding, leitura, lookup, descoberta, navegação
- File: começar por `specs/frontend/ROUTES.md`; depois `specs/frontend/BUSINESS_RULES.md`; por fim `specs/frontend/INTEGRATIONS.md`
- Related: debugging, manutenção, implementação de feature, revisão
