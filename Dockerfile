# Build the web app
FROM node:24-alpine AS web
WORKDIR /web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web ./
RUN npm run build

# Runtime: Bun serves the API and the built web app
FROM oven/bun:1.4-slim

WORKDIR /app

COPY src ./src
COPY kbbi-dataset-kbbi-v-main/json ./kbbi-dataset-kbbi-v-main/json
COPY --from=web /web/dist ./web/dist

ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/api').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "run", "src/server.ts"]
