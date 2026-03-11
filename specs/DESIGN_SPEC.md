# DESIGN_SPEC

## 1. Overview

`Pense Aja` is an internal idea-management application for Grupo Dass units. The platform allows employees to register improvement ideas, managers and analysts to evaluate them, and business areas to monitor engagement and results through dashboards and reports.

The repository is split into:

- `cliente/`: Vue 3 + Vite SPA with Pinia, Vue Router, Vuetify, Tailwind utilities, Axios, Chart.js, and PWA support.
- `server/`: Express + TypeScript API backed by PostgreSQL, Redis, RabbitMQ, and Gemini AI.

## 2. Spec Navigation

Use this file as the high-level system map. For implementation details, prefer the dedicated specs:

- Frontend specs: [specs/frontend/README.md](/home/oendel/code/dass/pense_aja_app/specs/frontend/README.md)
- Backend specs: [specs/backend/README.md](/home/oendel/code/dass/pense_aja_app/specs/backend/README.md)

Detailed frontend documentation lives under:

- [specs/frontend/ARCHITECTURE.md](/home/oendel/code/dass/pense_aja_app/specs/frontend/ARCHITECTURE.md)
- [specs/frontend/ROUTES.md](/home/oendel/code/dass/pense_aja_app/specs/frontend/ROUTES.md)
- [specs/frontend/BUSINESS_RULES.md](/home/oendel/code/dass/pense_aja_app/specs/frontend/BUSINESS_RULES.md)
- [specs/frontend/INTEGRATIONS.md](/home/oendel/code/dass/pense_aja_app/specs/frontend/INTEGRATIONS.md)

Detailed backend documentation lives under:

- [specs/backend/ROUTES.md](/home/oendel/code/dass/pense_aja_app/specs/backend/ROUTES.md)
- [specs/backend/BUSINESS_RULES.md](/home/oendel/code/dass/pense_aja_app/specs/backend/BUSINESS_RULES.md)
- [specs/backend/INTEGRATIONS.md](/home/oendel/code/dass/pense_aja_app/specs/backend/INTEGRATIONS.md)

## 3. Product Goals

The current implementation supports four primary business goals:

1. Capture improvement ideas from employees with enough operational context for evaluation.
2. Route evaluation to managers and continuous-improvement analysts.
3. Reward participation through points and product redemption.
4. Provide operational visibility through dashboard metrics and downloadable reports.

## 4. Frontend Architecture

The frontend is a client-side SPA defined in `cliente/src/main.js` and `cliente/src/router/index.js`. This section is a summary only; the source of truth for frontend behavior is [specs/frontend/README.md](/home/oendel/code/dass/pense_aja_app/specs/frontend/README.md).

### Main routes

- `/`: marketing-style landing page.
- `/pense-aja`: idea list and entry point for registration.
- `/pense-aja/:id`: detailed idea view and evaluation screen.
- `/dashboard`: analytics and XLSX report export.
- `/user`: user profile, score summary, email, and notification preferences.
- `/news`: notification-oriented area.
- `/mic`: AI/audio-related tooling.

### State and session model

- Pinia store `userStore` hydrates user data from `sessionStorage`.
- Unit selection is read from `localStorage` through `unidadeDass`.
- Authentication is delegated to an external auth service on `${VITE_API_URL}:2399`.
- Business API calls target `${VITE_API_URL}:2512`.

### Client integration patterns

- Axios interceptors proactively refresh tokens and retry `401` responses.
- Protected flows rely on cookies plus session metadata stored in the browser.
- Dashboard data is aggregated server-side and rendered via dedicated composables and dashboard components.
- Report generation happens in the browser using `xlsx` and `file-saver`.

## 5. Backend Architecture

The backend entry point is `server/src/penseAja.ts`. It exposes four HTTP modules. This section is a summary only; the source of truth for backend behavior is [specs/backend/README.md](/home/oendel/code/dass/pense_aja_app/specs/backend/README.md).

- `/pense-aja/`: ideas, evaluations, products, and purchases.
- `/user/`: user profile lookup, unit detection, and notification settings.
- `/dashboard/`: summary, monthly, dimensional, highlight, and engagement data.
- `/ai/`: text-improvement endpoint backed by Gemini.

### Core backend responsibilities

- Validate unit, dates, registration, and email input.
- Persist and query idea records in PostgreSQL.
- Enforce role-based access for evaluation and product-management actions.
- Trigger notifications after idea creation and evaluation.
- Consume RabbitMQ messages for asynchronous product-upload processing.
- Check Redis blacklist entries before accepting authenticated requests.

## 6. Data and External Dependencies

### PostgreSQL

The system uses PostgreSQL as the primary datastore. The code references schemas such as:

- `pense_aja.pense_aja_dass`
- `pense_aja.pense_aja_pontos`
- `pense_aja.pense_aja_premios`
- `colaborador.lista_funcionario[_UNIDADE]`
- `autenticacao.usuarios`
- `autenticacao.emails`
- `core.unidades_dass`

### Redis

Redis is used for token blacklist checks. A request with a cookie token is rejected if the key `bl_<token>` exists.

### RabbitMQ

The worker `uploadListener.ts` consumes queue `pense_aja`, applies retry/DLQ behavior, and currently supports asynchronous product creation workflows.

### External services

- Authentication service on port `2399` for login, logout, and token refresh.
- Notification API configured by environment variables.
- Gemini API for AI-assisted text improvement and summarization.

## 7. Primary User Flows

### Idea registration

The frontend collects employee registration, project metadata, sector, factory, before/after descriptions, gains, and lean-loss categories. The backend validates required fields, prevents duplicates with an advisory lock plus duplicate query, persists the record, and optionally notifies the employee’s manager.

### Idea evaluation

The detailed idea view exposes evaluation context to authorized roles. Backend access is restricted to functions containing `analista`, `gerente`, or `automacao`. After evaluation, the API updates the record, resolves the evaluator identity, and can notify the original employee.

### User profile and notifications

The profile page loads score, classification counts, email, and enabled notification apps. The backend persists email and app notification preferences in `autenticacao.emails`.

### Dashboard and reporting

Dashboard endpoints aggregate ideas by period and dimension. The frontend composes summary cards, trends, engagement panels, and exports a multi-sheet XLSX report.

## 8. Deployment Model

- Frontend: built with Vite and served by Nginx, exposed on port `5050`.
- Backend: built to `dist/` and exposed on port `2512`.
- Frontend resolves API hosts from `VITE_API_URL`.
- Backend uses `.env` or `.env.production` depending on `DEV_ENV`.

## 9. Design Constraints and Current Risks

- There is no automated test suite configured in either package.
- Auth depends on a separate service not versioned in this repository.
- Business rules are strongly coupled to database schemas and Dass unit naming.
- Some behavior is implicit in browser storage (`sessionStorage` and `localStorage`).
- AI tooling exists server-side, but the related frontend action is currently disabled.
- Product/store functionality exists in both frontend and backend, but it is not surfaced as a primary route in the current router.
- Validation and status naming are not fully normalized across all modules (`approve`/`APROVADO`, `reprove`/`REPROVADO`).

## 10. Recommended Evolution

1. Add automated tests for route validation, service queries, and token-refresh behavior.
2. Extract shared domain enums for status, unit, role, and classification values.
3. Document the external auth and notification contracts explicitly.
4. Consolidate environment-variable documentation and required runtime dependencies.
5. Decide whether store/product features remain active roadmap items or should be removed from the active codebase.
