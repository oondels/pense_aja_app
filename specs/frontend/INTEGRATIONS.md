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

### Papel arquitetural

- o serviço externo continua responsável por identidade
- o backend do Pense&Aja continua responsável por autorização e contexto de negócio

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
- o cadastro de ideia usa `commonApi` e endpoint público; avaliação, perfil e administração continuam usando permissões
- solicitação de resgate no marketplace usa `api` por exigir login, mas não exige permissão RBAC específica

### Evolução esperada

- respostas do backend devem poder incluir permissões, papéis, saldo consolidado e estado de resgate sem depender de cálculo local
- marketplace expõe listagens paginadas para administração, consulta autenticada do próprio usuário e consulta pública por matrícula/unidade

## Upload Service

Usado pelo módulo de loja e pelo cadastro administrativo de novos itens do catálogo.

- endpoint hardcoded: `http://10.100.1.43:3020/`
- headers usados:
  - `x-service: pense_aja`
  - `x-subfolder: <dassOffice>`
  - `x-dass-office: <dassOffice>`

## Browser Storage

### sessionStorage

- sessão e identidade
- tempo de expiração informado pelo serviço de auth

### Modelo-alvo

- pode armazenar permissões e papéis retornados pelo backend para UX
- não substitui a verificação do backend

### localStorage

- unidade Dass
- `unitConfig:<unidadeDass>` retornado por `/user/session-context/:dassOffice`
- `viewMode:*` para preferência local de cards/lista por tela
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
- parte da renderização de permissão e status ainda depende de heurística local
