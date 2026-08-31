FROM oven/bun:1.2.22 AS build

WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY services/backend/package.json ./package.json
RUN bun install

COPY services/backend/prisma ./prisma
COPY services/backend/tsconfig.json ./tsconfig.json
COPY services/backend/src ./src
RUN bunx prisma generate && bun run build

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/server.js"]
