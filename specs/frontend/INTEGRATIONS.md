# Frontend Integrations

## Runtime base URL

- variável principal: `VITE_API_URL`
- arquivo: `cliente/src/config/ip.js`

Ela é usada para montar:

- `${VITE_API_URL}:2399` para autenticação
- `${VITE_API_URL}:2512` para API de negócio

## Authentication Service

Consumido por `authApi`.

### Endpoints usados

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/token/refresh`
- `PUT /user/email/:matricula` via auth service na coleta de email

### Comportamento

- autenticação usa cookies e `withCredentials: true`
- refresh é executado de forma proativa e reativa pelo interceptor

## Backend API

Consumido por `api` e `commonApi`.

### Domínios usados

- `/pense-aja/*`
- `/user/*`
- `/dashboard/*`
- `/ai/*`

### Observação

- `api` é reservado para chamadas autenticadas que devem participar da lógica de refresh
- `commonApi` faz chamadas sem esse interceptor

## Upload Service

Usado pelo módulo de loja.

- endpoint hardcoded: `http://10.100.1.43:3020/`
- headers usados:
  - `x-service: pense_aja`
  - `x-subfolder: <dassOffice>`
  - `x-dass-office: <dassOffice>`

## Browser Storage

### sessionStorage

- sessão e identidade
- tempo de expiração informado pelo serviço de auth

### localStorage

- unidade Dass
- preferências de onboarding/news/email popup

## PWA

- registro: `useRegisterSW()` em `main.js`
- instalação: `beforeinstallprompt` via `usePwaInstall`

## UI Libraries

- Vuetify
- Bootstrap Icons
- Material Design Icons
- Tailwind CSS
- Vue Virtual Scroller
- vue-rewards
- vue-lazyload

## Dashboard and Export

- `chart.js` e `vue-chartjs` para widgets analíticos
- `xlsx` para geração de workbook
- `file-saver` para download do arquivo

## Docker and Delivery

### Frontend container

- build multi-stage com Node e Nginx
- bundle estático servido na porta `80` dentro do container
- compose expõe `5050:80`

### Arquivos

- `cliente/Dockerfile`
- `cliente/docker-compose.yml`
- `cliente/nginx.conf`

## Operational Risks

- integração de upload não usa env e depende de IP fixo
- o frontend depende de múltiplos serviços externos estarem disponíveis ao mesmo tempo
- parte da UX assume que cookies cross-origin e `withCredentials` estão corretamente configurados no ambiente
