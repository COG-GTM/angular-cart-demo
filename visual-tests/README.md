# visual-tests

Playwright + pixelmatch visual regression harness comparing the AngularJS client
(`client/`, served by the Express app on `:9000`) against the React port
(`react-app/`, served on `:4173`).

Both apps get the *same* fixture response for `GET /api/products` via Playwright
route interception (`fixtures/products.json`, derived from `server/config/seed.js`
with fixed ids), so diffs only reflect rendering differences. Screenshots are not
committed — see `.gitignore`.

## Matrix

`matrix.ts` derives the views from the source app's ui-router states (`products`
at `/`, `cart` at `/cart`) plus their key UI states, each at 1280×800 and 375×812:
`products`, `products-search`, `products-in-cart`, `cart-empty`, `cart-items`.

## Usage

```bash
npm install && npx playwright install chromium

# Legacy client only: reproduce Grunt's Babel + Sass steps into .tmp/ without
# touching client/ sources (needs babel-core 5 on NODE_PATH, see below).
npm run build:source

npm run capture:both   # SOURCE_URL / REACT_URL env vars override the defaults
npm run compare        # fails if any pair is >= 2% mismatch (MISMATCH_THRESHOLD)
```

### Running the legacy AngularJS app on modern Node

The original toolchain (Node ^4, Bower, PhantomJS, grunt-contrib-sass) does not
install on Node 20. What works:

```bash
npm install --omit=dev --ignore-scripts          # skips the PhantomJS install
(cd client && bower install --allow-root)
npm install --prefix ~/legacy-deps --ignore-scripts babel-core@5
docker run -d --name legacy-mongo -p 27017:27017 mongo:3.6   # mongoose 4 can't speak to Mongo 7
(cd visual-tests && NODE_PATH=~/legacy-deps/node_modules node build-source.js)
NODE_PATH=~/legacy-deps/node_modules node server
```

`build-source.js` transpiles `client/app` and `client/components` into `.tmp/`
exactly like the Grunt `babel` task, which the Express static config already
serves; no source file is modified.
