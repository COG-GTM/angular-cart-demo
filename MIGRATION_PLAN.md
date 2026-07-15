# AngularJS 1.x → Angular 19 Migration Plan

This repo (`angular-cart-demo`, an AngularJS ~1.4 MEAN "clothes shop") is being
migrated from AngularJS to **Angular 19**. The Express / MongoDB / socket.io
backend in `server/` stays; only the browser client is being rewritten.

The work is split across a **foundation** (this branch) plus **4 parallel child
sessions**. Each child branches off `devin/ng19-migration`, owns a disjoint set
of files, and opens a PR **into `devin/ng19-migration`** (the integration
branch) — never into `master`/upstream. After all four merge, a final PR takes
`devin/ng19-migration` → `master`.

> Repo is a fork under **COG-GTM**. All PRs target `COG-GTM/angular-cart-demo`.

---

## What the foundation already provides (do not recreate)

- Angular 19 CLI workspace at the repo root (standalone components, SCSS).
  - `src/main.ts`, `src/index.html`, `src/styles.scss`
  - `angular.json`, `tsconfig*.json`
  - Bootstrap 3 + Font Awesome wired via `angular.json` `styles`.
  - Product images live in `public/assets/images/*` (served at `/assets/images/*`).
- Bootstrap + DI:
  - `src/app/app.config.ts` — `provideRouter(routes)` + `provideHttpClient()`.
  - `src/app/app.routes.ts` — lazy routes: `''` → Products, `'cart'` → Cart.
  - `src/app/app.component.*` — root shell containing `<router-outlet/>` and a
    TODO marker where `<app-navbar>` should be added.
- Shared, already-implemented core:
  - `src/app/core/cart.service.ts` — `CartService` (root-provided). Interface:
    `addItem(id, name, price, quantity)`, `removeItem(id): boolean`,
    `containsItem(id): boolean`, `totalItems(): number`, `itemQuantity(id): number`,
    `items(): CartItem[]`, `totalPrice(): number`. Type: `CartItem { _id, name, price, quantity }`.
  - `src/app/core/app-config.ts` — `APP_CONFIG` InjectionToken (`{ userRoles }`).
- `server/config/express.js` + `server/routes.js` updated to serve the Angular
  build output (`dist/client/browser`) with SPA fallback to `index.html`.
- Placeholder standalone components (to be REPLACED by feature sessions):
  - `src/app/features/products/products.component.ts`
  - `src/app/features/cart/cart.component.ts`

Verify locally: `npm install` then `npm run build` (`ng build`) — must succeed.

---

## Child session ownership (parallel, disjoint)

### Session 1 — Products feature
Owns: `src/app/features/products/**`, `src/app/core/product.service.ts`,
`src/app/core/socket.service.ts`.
Port from: `client/app/products/products.controller.js`, `products.html`,
`products.controller.spec.js`; `client/components/socket/socket.service.js`.
- `ProductService`: `HttpClient` GET `/api/products` → `Product[]`
  (`Product { _id, name, description, price, images: string[], quantity, active }`).
- `SocketService`: wrap `socket.io-client` (connect with `path: '/socket.io-client'`),
  expose `syncUpdates(model, array, cb?)` / `unsyncUpdates(model)` (ports the
  btford.socket-io helper). Products live-syncs the `'product'` model.
- `ProductsComponent` (standalone): loads products, search filter + order by name,
  Add-to-cart / in-cart state via injected `CartService`, out-of-stock styling.
  Replace `orderBy`/`filter`/`currency:"£"` with Angular pipes / component logic.
- Add a Jasmine spec (`products.component.spec.ts`).

### Session 2 — Cart feature
Owns: `src/app/features/cart/**`.
Port from: `client/app/cart/cart.controller.js`, `cart.html`, `cart.controller.spec.js`.
- `CartComponent` (standalone): reads shared `CartService`, renders items table,
  remove-from-cart button, empty-cart message, and total (`currency:"£"`).
- Product detail links point to `/products/:id` in the original; keep the same
  hrefs (no product-detail route exists — leave as-is / routerLink to `/`).
- Add a Jasmine spec (`cart.component.spec.ts`).

### Session 3 — Shared UI components
Owns: `src/app/shared/navbar/**`, `src/app/shared/modal/**`, `src/app/core/util.service.ts`.
Port from: `client/components/navbar/*`, `client/components/modal/*`,
`client/components/util/util.service.js`.
- `NavbarComponent` (standalone, selector `app-navbar`): menu (Products `/`, Cart `/cart`)
  using `routerLink` + `routerLinkActive`, collapse toggle (ng-bootstrap `NgbCollapse`
  or a simple boolean). **Add `<app-navbar>` to `src/app/app.component.html`** at
  the TODO marker.
- `ModalService` + modal component: replace `ui.bootstrap $modal` with
  `@ng-bootstrap/ng-bootstrap` `NgbModal`. Preserve the `confirm.delete(cb)` API shape.
- `UtilService`: port `safeCb`, `urlParse`, `isSameOrigin`.
- Specs for the above.

### Session 4 — Build tooling, server integration, e2e & docs
Owns: root tooling + docs (NOT the `src/app/**` feature code).
- Remove dead AngularJS/Grunt/Bower tooling: `Gruntfile.js`, `bower.json`,
  `karma.conf.js` (old), `protractor.conf.js`, `mocha.conf.js`, `.jshintrc`,
  leftover `client/**` AngularJS sources, and any obsolete `grunt-*`/`bower` config.
- Ensure `npm start` runs Express serving the built client (document the
  `ng build` → `node server` flow; Mongo required). Add an `npm run dev` if helpful.
- Update `Dockerfile` / `docker-compose.yml` for the Angular CLI build.
- Migrate the Protractor `e2e/` suite to Playwright (the repo already lists
  `@playwright/test` patterns elsewhere in the org) or Angular's default e2e.
- Update `README.md` for the Angular 19 dev workflow.

---

## Conventions
- Standalone components, `OnPush`-friendly, typed (no `any`).
- Commit messages must contain `feature` or `bug` (repo convention).
- Keep the backend API/socket contract unchanged.
