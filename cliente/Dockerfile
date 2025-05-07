# 1) Build
FROM node:18-alpine AS builder

# define diretório de trabalho
WORKDIR /app

# copia apenas package.json + lockfile para cache de dependências
COPY package*.json ./

# instala dependências
RUN npm ci

# copia o restante do código
COPY . .

# gera os arquivos estáticos em /app/dist
RUN npm run build

# 2) Runtime
FROM nginx:stable-alpine

# copia build final para pasta que o nginx serve
COPY --from=builder /app/dist /usr/share/nginx/html

# (opcional) use um nginx.conf customizado
COPY nginx.conf /etc/nginx/conf.d/default.conf

# expõe porta padrão do nginx
EXPOSE 80

# comando padrão
CMD ["nginx", "-g", "daemon off;"]
