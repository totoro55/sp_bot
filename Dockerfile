FROM node:22-bookworm-slim AS build

ARG HTTP_PROXY=""
ARG HTTPS_PROXY=""
ARG NO_PROXY=""

WORKDIR /app

COPY package.json package-lock.json ./
RUN if [ -n "$HTTP_PROXY" ]; then \
      export HTTP_PROXY="$HTTP_PROXY" \
        HTTPS_PROXY="${HTTPS_PROXY:-$HTTP_PROXY}" \
        http_proxy="$HTTP_PROXY" \
        https_proxy="${HTTPS_PROXY:-$HTTP_PROXY}" \
        NO_PROXY="$NO_PROXY" \
        no_proxy="$NO_PROXY"; \
    fi && npm ci

COPY tsconfig.json index.ts ./
COPY api ./api
COPY bot ./bot
COPY config ./config
COPY types ./types
RUN npm run build

FROM node:22-bookworm-slim AS runtime

ARG HTTP_PROXY=""
ARG HTTPS_PROXY=""
ARG NO_PROXY=""

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN if [ -n "$HTTP_PROXY" ]; then \
      export HTTP_PROXY="$HTTP_PROXY" \
        HTTPS_PROXY="${HTTPS_PROXY:-$HTTP_PROXY}" \
        http_proxy="$HTTP_PROXY" \
        https_proxy="${HTTPS_PROXY:-$HTTP_PROXY}" \
        NO_PROXY="$NO_PROXY" \
        no_proxy="$NO_PROXY"; \
    fi && npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY files ./files

CMD ["node", "dist/index.js"]
