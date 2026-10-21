FROM node:22-bookworm-slim

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
CMD ["node", "dist/index.js"]
