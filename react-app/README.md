# react-app

React 18 + TypeScript (Vite) port of the AngularJS 1.x client in `client/`. The
Express + MongoDB API in `server/` is unchanged and remains the data source.

## Running

```bash
npm install
npm run dev      # http://localhost:4173, /api proxied to http://localhost:9000
npm run build    # type-check + production build to dist/
npm run preview  # serve dist/ on http://localhost:4173 with the same /api proxy
npm run lint
```

Point the proxy at a different backend with `API_TARGET=http://host:port npm run dev`.

## Structure

| Path | AngularJS counterpart |
| --- | --- |
| `src/pages/ProductsPage.tsx` | `client/app/products/*` (`products` ui-router state, url `/`) |
| `src/pages/CartPage.tsx` | `client/app/cart/*` (`cart` ui-router state, url `/cart`) |
| `src/components/Navbar.tsx` | `client/components/navbar/*` |
| `src/cart/CartProvider.tsx` | `client/app/cartService/cartService.service.js` |
| `src/services/productService.ts` | `$http.get('/api/products')` |
| `src/utils/currency.ts` | `{{ value \| currency:"£" }}` |
| `src/styles/` | `client/app/app.scss` and its component partials |

Bootstrap 3 (`bootstrap-sass`) and Font Awesome are imported from npm instead of
Bower; their font files are copied into `public/fonts/` and product imagery into
`public/assets/images/` so paths match the source app.
