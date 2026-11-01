# syntax=docker/dockerfile:1
# Full-stack AEGIS: Express API + built React app in one container.

FROM node:20-bookworm-slim AS build
WORKDIR /app
ENV HUSKY=0
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY web/package.json web/
COPY server/prisma server/prisma
RUN npm ci
COPY . .
# Keep dev deps: the prisma CLI runs "migrate deploy" at start-up.
RUN npm run build -w server && npm run build -w web

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production \
    PORT=8787 \
    WEB_DIST=/app/web/dist \
    DATABASE_URL=file:/data/aegis.db
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/package.json package.json
COPY --from=build /app/server/package.json server/package.json
COPY --from=build /app/server/prisma server/prisma
COPY --from=build /app/server/dist server/dist
COPY --from=build /app/web/dist web/dist
RUN mkdir -p /data
VOLUME ["/data"]
EXPOSE 8787
WORKDIR /app/server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
