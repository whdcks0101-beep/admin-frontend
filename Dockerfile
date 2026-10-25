FROM node:24-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Vite embeds this public browser-facing address during the build.
ARG VITE_BACKEND_ORIGIN=http://localhost:8080
ENV VITE_BACKEND_ORIGIN=${VITE_BACKEND_ORIGIN}
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
