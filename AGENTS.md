# Repository Guidelines

## Agent Scope
Unless the user explicitly says otherwise, work only in the backend under `server/`. Treat frontend changes in `cliente/` as out of scope by default. For backend tasks, prioritize `server/src/routes/`, `server/src/services/`, `server/src/middlewares/`, `server/src/config/`, and `server/src/workers/`.

## Project Structure & Module Organization
This repository has two apps: `cliente/` for the Vue 3 + Vite frontend and `server/` for the TypeScript/Express API. Frontend code lives in `cliente/src/` with `components/`, `views/`, `services/`, `stores/`, `router/`, and `composables/`. Static assets and PWA icons live in `cliente/public/`. Backend code lives in `server/src/` with `routes/`, `services/`, `middlewares/`, `config/`, `types/`, `utils/`, and `workers/`. TypeScript build output goes to `server/dist/`.

## Build, Test, and Development Commands
Install dependencies per package with `npm install` in `cliente/` and `server/`. For day-to-day work, default to backend commands.

- `cd cliente && npm run dev`: start the Vite frontend locally.
- `cd cliente && npm run build`: produce the production frontend bundle.
- `cd cliente && npm run preview`: serve the built frontend for a quick smoke test.
- `cd server && npm run dev`: run the API with `ts-node` and `nodemon`.
- `cd server && npm run build`: compile backend TypeScript into `server/dist/`.
- `cd server && npm start`: run the compiled API from `dist/penseAja.js`.

## Coding Style & Naming Conventions
Use 2-space indentation in Vue, JavaScript, and TypeScript files, and keep semicolons in backend TypeScript. Match the surrounding file style before reformatting unrelated code. Use PascalCase for Vue components and views, camelCase for composables and services, and suffix backend route files with `.route.ts`. Keep shared JSON assets in `utils/` or `src/utils/` rather than embedding large constants inline.

## Testing Guidelines
There is no automated test runner configured yet. Treat `npm run build` in both `cliente/` and `server/` as the minimum validation step, then do a manual smoke test of the affected UI flow or API route. If you add tests, place them close to the feature and use `*.spec.ts` or `*.spec.js` naming.

## Commit & Pull Request Guidelines
Commits must follow this required format: `<type>(<scope>): <titulo curto>`. Allowed types are `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, and `perf`. Use a backend-focused scope that matches the affected area, such as `auth`, `api`, `db`, `infra`, or `worker`. Keep the subject imperative, specific, and within 72 characters; avoid vague subjects like `update` or `changes`.

Add a body when the change is not trivial, explaining what changed, why it changed, and any risks or migration notes. Before committing, review `git status`, keep unrelated changes out of the same commit, and run the relevant backend checks. Example: `fix(api): corrige validacao de token no middleware`.

## Security & Configuration Tips
Server runtime configuration is loaded through `server/src/config/dotenv.ts`. Keep secrets in local environment files, not in source. When changing CORS, ports, or external service access, update both the backend config and any matching frontend service or interceptor usage.
