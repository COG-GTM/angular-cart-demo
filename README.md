# angular-cart-demo

Example shopping cart application built with **Angular 19** on the client and an
**Express / MongoDB / Socket.IO** backend (`server/`).

> Originally an AngularJS 1.x / Grunt / Bower MEAN app, the browser client has
> been migrated to Angular 19 (standalone components, Angular CLI, SCSS). The
> Express + MongoDB backend and its REST/socket contract are unchanged.

## Prerequisites

- [Node.js](https://nodejs.org/) `>= 18` and npm `>= 9`
- [MongoDB](https://www.mongodb.org/) — keep a running daemon with `mongod`
  (defaults: `mongodb://localhost/angularclothesshop-dev` in development)

## Install

```bash
npm install
```

## Build

The Angular CLI builds the browser client into `dist/client/browser`:

```bash
npm run build            # production build (default)
npm run watch            # rebuild on change (development configuration)
```

## Run

`npm start` runs the Express server, which serves the built Angular client from
`dist/client/browser` (with SPA fallback to `index.html`) and exposes the
`/api/**` + Socket.IO endpoints. Build the client first, and make sure MongoDB
is running:

```bash
npm run build            # produces dist/client/browser
mongod                   # in a separate shell (if not already running)
npm start                # Express serves the built client on http://localhost:9000
```

### Dev workflow (live reload)

For a fast client dev loop, run the Angular dev server (port 4200) alongside the
Express backend. The dev server proxies `/api` and `/socket.io-client` to Express
(see `proxy.conf.json`):

```bash
mongod                   # terminal 1
npm start                # terminal 2 — Express API on :9000
npm run dev              # terminal 3 — Angular dev server on http://localhost:4200
```

## Unit tests

Unit tests run with Karma + Jasmine via the Angular CLI:

```bash
npm test
```

## End-to-end tests

E2E tests use [Playwright](https://playwright.dev/) (the suite lives in `e2e/`).
Install the browsers once, then run the suite:

```bash
npm run e2e:install      # one-time: download Playwright browsers
npm run e2e
```

By default Playwright starts an Angular dev server automatically and runs the
specs against it (no MongoDB required for the smoke tests). To run against an
already-running instance instead (e.g. the Express server), set `E2E_BASE_URL`:

```bash
E2E_BASE_URL=http://localhost:9000 npm run e2e
```

## Docker

Build and run the full stack (Angular build + Express server + MongoDB) with
Docker Compose:

```bash
docker compose up --build
```

The multi-stage `Dockerfile` builds the Angular client and runs the Express
server against it; `docker-compose.yml` wires in the MongoDB service.
