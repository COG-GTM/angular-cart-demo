# syntax=docker/dockerfile:1

# Build stage: install toolchain, client (bower) deps and run the grunt production build
FROM node:22-bookworm AS build
WORKDIR /src
RUN npm install -g bower@1.8.14 grunt-cli@1.5.0
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY bower.json .bowerrc ./
RUN bower install --allow-root
COPY . .
RUN grunt build

# Runtime stage: production dependencies and the built dist only
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=8080
WORKDIR /app
COPY --from=build /src/package.json /src/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY --from=build /src/dist ./
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 8080) + '/healthz').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
CMD ["node", "server"]
