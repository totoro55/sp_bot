FROM node:22-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends libjemalloc2 \
    && rm -rf /var/lib/apt/lists/* \
    && jemalloc="$(find /usr/lib -name 'libjemalloc.so.2' | head -n 1)" \
    && test -n "$jemalloc" \
    && ln -sf "$jemalloc" /usr/local/lib/libjemalloc.so.2

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm ci

COPY tsconfig.json index.ts ./
COPY api ./api
COPY bot ./bot
COPY config ./config
COPY types ./types
RUN npm run build \
    && npm prune --omit=dev \
    && npm cache clean --force

COPY files ./files

ENV NODE_ENV=production
ENV LD_PRELOAD=/usr/local/lib/libjemalloc.so.2
ENV MALLOC_CONF=background_thread:true,dirty_decay_ms:1000,muzzy_decay_ms:1000
CMD ["node", "dist/index.js"]
