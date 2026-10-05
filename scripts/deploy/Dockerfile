FROM node:22-slim AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS=--max-old-space-size=8192
WORKDIR /app
RUN corepack enable
COPY . /app
RUN --mount=type=cache,id=newbee-ui-pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# Use the workspace entry point: it builds browser packages before web-antd.
RUN cat apps/.env apps/.env.production > apps/web-antd/.env.production && pnpm build:antd

FROM nginx:stable-alpine AS production
ENV CORE_API_UPSTREAM=host.docker.internal:9101 \
    CMDB_API_UPSTREAM=host.docker.internal:9207 \
    IO_API_UPSTREAM=host.docker.internal:9501 \
    OPS_API_UPSTREAM=host.docker.internal:9601
COPY --from=builder /app/apps/web-antd/dist /usr/share/nginx/html
COPY scripts/deploy/nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
