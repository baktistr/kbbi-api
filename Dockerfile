FROM oven/bun:1.4-slim

WORKDIR /app

COPY src ./src
COPY kbbi-dataset-kbbi-v-main/json ./kbbi-dataset-kbbi-v-main/json

ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "run", "src/server.ts"]
