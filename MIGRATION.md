# Migration: angular-cart-demo → Node 22 LTS and the internal x86 Kubernetes platform

Part of the app migration wave. Network zone: **intranet** (the platform network reaches the existing datastore, so compute moves and MongoDB stays).

## Runtime and package manager

| | Before | After |
|---|---|---|
| Node | 4.2.4 (`Dockerfile` `mhart/alpine-node:4.2.4`, `.travis.yml` `node_js: 4.2.4`; `engines.node ^4.2.3`) | 22 LTS (`engines.node >=22 <23`, `.nvmrc` `22`, `node:22-bookworm` / `node:22-bookworm-slim`) |
| npm | ^2.14.7 (no lockfile) | >=10, `package-lock.json` committed, `npm ci` everywhere |
| Client deps | Bower (`bower.json`, `.bowerrc` → `client/bower_components`) | unchanged (Bower 1.8.14, installed in the build stage only) |
| Build tool | Grunt 0.4 (`Gruntfile.js`, `jit-grunt`), Babel 5 for server ES modules, Ruby Sass | Grunt 1.6, Babel 5 (unchanged), Dart Sass via `grunt-sass` |
| CI | Travis CI (`.travis.yml`, `.travis-script.sh`; Sauce Labs, Code Climate, PhantomJS) | GitHub Actions `.github/workflows/container-image.yml` |
| Container | single stage, root user, build tools installed then removed, `npm start` | multi-stage, non-root `node` user, `HEALTHCHECK` on `/healthz` |

## Packages with a known break on Node 22

| Package | Break | Resolution |
|---|---|---|
| `phantomjs` 1.9, `karma-phantomjs-launcher` | installer throws `ERR_INVALID_ARG_TYPE`; PhantomJS abandoned | removed; Karma uses headless Chrome (`karma-chrome-launcher` 3) |
| `grunt-node-inspector` → `node-inspector` → `v8-debug` | native addon, no Node 22 binary, does not compile | removed; debug uses `node --inspect-brk` |
| `mongoose` 4 / `connect-mongo` 0.8 | legacy OP_QUERY wire protocol rejected by MongoDB ≥ 6 | `mongoose` 8, `connect-mongo` 5 |
| `bluebird` `promisifyAll(mongoose)` | `*Async` methods no longer exist on Mongoose 8 models | removed; native promises |
| `grunt-contrib-sass` | needs Ruby Sass (end-of-life) | `grunt-sass` 3 + `sass` (Dart Sass) |
| Grunt 0.4 plugins pulling `graceful-fs` 3 (e.g. `grunt-google-cdn`) | `ReferenceError: primordials is not defined` | Grunt 1.6, plugin upgrades, `overrides.graceful-fs` ^4.2.11 |
| `grunt-mocha-test` 0.12 | `Mocha is not a constructor` | `grunt-mocha-test` 0.13 + `mocha` 10 |
| `karma` 0.13, `karma-jasmine` 0.3, `grunt-karma` 0.12 | do not run on Node 22 | `karma` 6, `karma-jasmine` 4, `grunt-karma` 4 |

Not used at runtime and left as-is (dev-only, not on the test/build path): Protractor/Sauce Connect e2e tooling, `grunt-contrib-imagemin`, `grunt-build-control`. They install on Node 22 but the e2e suite needs a Selenium/Sauce setup that is out of scope.

## Datastores, caches, buckets, external APIs

- **MongoDB** (only datastore). Collections: `products` (seeded by `server/config/seed.js` when `seedDB` is set) and `sessions` (express-session store via `connect-mongo`, db `angular-clothes-shop`). The session store is the only cache.
- **Buckets:** none; product images are static files in `client/assets/images`.
- **External APIs:** none. Socket.IO is served by the app itself (`server/config/socketio.js`).

## Environment variables and where they are read

| Variable | Read in | Purpose |
|---|---|---|
| `NODE_ENV` | `server/index.js`, `server/config/environment/index.js` | selects `development` / `test` / `production` config |
| `PORT` | `server/config/environment/index.js`, `production.js` | listen port (dev 9000, prod 8080) |
| `IP` | `server/config/environment/index.js`, `production.js` | bind address |
| `MONGODB_URI` (new) | `server/config/environment/production.js` | explicit MongoDB URI; takes precedence over link vars |
| `MONGO_PORT_27017_TCP_ADDR`, `MONGO_PORT_27017_TCP_PORT` | `server/config/environment/production.js` | legacy Docker link variables (fallback) |
| `SESSION_SECRET` (new) | `server/config/environment/index.js` | session cookie secret (was a hard-coded literal) |
| `seedDB` | `server/config/environment/production.js` | reseed `products` on start |

Dev/test URIs are fixed: `mongodb://localhost/angularclothesshop-dev` and `mongodb://localhost/angularclothesshop-test`.

## Ports

- 8080: HTTP + Socket.IO (production / container)
- 9000: HTTP in `grunt serve` development, 35729: livereload (dev only)
- 27017: MongoDB

## Build steps

1. `npm ci`
2. `bower install`
3. `grunt build` → `dist/` (`dist/server` transpiled by Babel, `dist/client` minified/revved assets, `dist/package.json`)
4. Runtime: `npm ci --omit=dev` + `dist/`, start with `node server`

Tests: `npm test` (`grunt test` = server unit + integration via Mocha against a local MongoDB, then client unit via Karma/headless Chrome).

## How secrets get into the build today

- Before: no secrets in the image; the session secret was a literal in source. Travis used encrypted env vars for Sauce Labs and Code Climate tokens.
- After: the build needs no secrets. Runtime gets `SESSION_SECRET` and the MongoDB URI from the environment (Kubernetes Secret / ConfigMap). CI pushes to the internal registry only when registry secrets are configured, referenced by name (`INTERNAL_REGISTRY_URL`, `INTERNAL_REGISTRY_USERNAME`, `INTERNAL_REGISTRY_PASSWORD`).

## Target design

- **Moves:** the Node web tier, as a `linux/amd64` container image built by GitHub Actions, deployed from `platform/dev/angular-cart-demo/` in the infra repo (Deployment, Service, Ingress, ConfigMap, Secret reference).
- **Stays:** the existing MongoDB. The ConfigMap sets `MONGODB_URI` to the existing intranet endpoint (no credentials in it); the session secret comes from a deploy-time Secret.
- **Network path:** platform pods → existing MongoDB on 27017 over the intranet. Ingress → Service:80 → pod:8080 (HTTP and Socket.IO long-polling/websocket).
- **Health:** `GET /healthz` returns 200 when the MongoDB connection is up, 503 otherwise; used by the image `HEALTHCHECK` and the Kubernetes probes.
- **Local proof:** `docker-compose.migration.yml` runs the app, MongoDB 7 and MinIO (S3 stand-in; the app has no bucket today).
