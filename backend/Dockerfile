FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache curl chromium

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY src/ ./src/
COPY server.js ./

RUN mkdir -p uploads && chown -R node:node /app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

USER node

CMD ["node", "server.js"]
