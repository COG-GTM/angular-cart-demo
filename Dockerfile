# --- Build stage: compile the Angular 19 client into dist/client/browser ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Runtime stage: Express server serving the built client ---
FROM node:20-alpine

LABEL maintainer="Capgemini"

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY server ./server
COPY --from=build /app/dist ./dist

EXPOSE 8080

# The server sources use ES module syntax transpiled on the fly by babel,
# so register the hook explicitly for the production runtime.
CMD ["node", "-r", "babel-core/register", "server/app.js"]
