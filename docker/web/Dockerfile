FROM node:20-alpine AS build

WORKDIR /app

# Dependências primeiro (cache)
COPY package.json package-lock.json ./
RUN npm ci

# Código necessário para o build
COPY client ./client
COPY shared ./shared
COPY attached_assets ./attached_assets
COPY vite.config.ts tailwind.config.ts tsconfig.json postcss.config.js components.json ./

RUN npm run build

FROM nginx:alpine

COPY docker/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/public /usr/share/nginx/html


