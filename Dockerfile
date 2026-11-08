FROM node:22.23.2-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/simulator/package.json packages/simulator/package.json
RUN pnpm install --frozen-lockfile
COPY apps ./apps
COPY packages ./packages
RUN pnpm db:generate && pnpm build

FROM build AS backend
ENV NODE_ENV=production AVATAR_UPLOAD_DIR=/app/uploads/avatars
RUN mkdir -p /app/uploads/avatars && chown -R node:node /app/uploads
COPY infra/backend-entrypoint.sh /app/backend-entrypoint.sh
WORKDIR /app/apps/backend
USER node
EXPOSE 3000
CMD ["sh", "/app/backend-entrypoint.sh"]

FROM nginx:1.28-alpine AS frontend
RUN apk add --no-cache openssl
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
COPY infra/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY infra/10-local-certificate.sh /docker-entrypoint.d/10-local-certificate.sh
RUN chmod +x /docker-entrypoint.d/10-local-certificate.sh
EXPOSE 80 443
