#!/usr/bin/env bash
#
# Reproducible setup for Capgemini/angular-cart-demo (AngularJS + Express + MongoDB).
#
# This 2015-era app targets Node ^4 / bower / grunt / ruby-sass. Rather than run the
# whole (broken-on-modern-machines) grunt toolchain, we:
#   - run the Express server on Node 4.9.1 (matches engines) in development mode
#   - run MongoDB in Docker
#   - install only runtime deps, pinning a few transitive deps that have since
#     drifted to ES6-only versions Node 4 cannot parse (lusca/debug/connect-livereload)
#   - compile SASS with dart-sass and pre-transpile the ES6 client into .tmp/
#     (Express serves .tmp/ before client/), so AngularJS 1.4 can DI-wire it.
#
# Idempotent: safe to re-run. Run from anywhere.
set -euo pipefail

REPO_DIR="${REPO_DIR:-$HOME/repos/angular-cart-demo}"
TOOLS_DIR="${TOOLS_DIR:-$HOME/acdemo-tools}"
NODE4="4.9.1"
APP_PORT="${PORT:-9000}"

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"

echo "==> [1/8] Ensure Node $NODE4 is installed"
nvm install "$NODE4" >/dev/null
nvm install 20 >/dev/null || true

echo "==> [2/8] Ensure MongoDB (Docker) is running on :27017"
if ! docker ps --format '{{.Names}}' | grep -q '^acdemo-mongo$'; then
  if docker ps -a --format '{{.Names}}' | grep -q '^acdemo-mongo$'; then
    docker start acdemo-mongo
  else
    docker run -d --name acdemo-mongo -p 27017:27017 mongo:4.4 >/dev/null
  fi
fi

cd "$REPO_DIR"

echo "==> [3/8] Install runtime deps (Node $NODE4)"
nvm use "$NODE4" >/dev/null
npm install --production --no-optional --no-audit --no-fund

echo "==> [4/8] Install era-correct pins Node 4 can parse"
npm install --no-save --no-optional --no-audit --no-fund \
  babel-core@5.8.38 \
  lusca@1.4.1 \
  debug@2.6.9 \
  connect-livereload@0.6.1
# connect-mongo ships a nested debug@4 (ES6); drop it so it resolves the top-level debug@2
rm -rf node_modules/connect-mongo/node_modules/debug

echo "==> [5/8] Install front-end (bower) deps (Node 20)"
nvm use 20 >/dev/null
npm list -g bower >/dev/null 2>&1 || npm install -g bower
bower install --config.interactive=false
# bower.json floats font-awesome to >=4.1.0 (resolves to 7.x, wrong scss layout); pin to 4.7.0
bower install font-awesome#4.7.0 --config.interactive=false --force-latest

echo "==> [6/8] Install build tools (dart-sass + babel) in $TOOLS_DIR"
mkdir -p "$TOOLS_DIR"
if [ ! -x "$TOOLS_DIR/node_modules/.bin/babel" ] || [ ! -x "$TOOLS_DIR/node_modules/.bin/sass" ]; then
  ( cd "$TOOLS_DIR" && npm init -y >/dev/null 2>&1 || true
    npm install --no-audit --no-fund \
      sass @babel/core@7 @babel/cli@7 @babel/preset-env@7 )
fi
SASS="$TOOLS_DIR/node_modules/.bin/sass"
BABEL="$TOOLS_DIR/node_modules/.bin/babel"

echo "==> [7/8] Compile SASS and transpile ES6 client into .tmp/"
mkdir -p .tmp/app
"$SASS" --no-source-map --quiet --load-path=client client/app/app.scss .tmp/app/app.css
rm -rf .tmp/components
"$BABEL" client/app        --out-dir .tmp/app        --presets @babel/preset-env --ignore "**/*.spec.js" >/dev/null
"$BABEL" client/components --out-dir .tmp/components  --presets @babel/preset-env --ignore "**/*.spec.js,**/*.mock.js" >/dev/null

echo "==> [8/8] Done. Start the app with:"
echo "    cd $REPO_DIR && . \"\$NVM_DIR/nvm.sh\" && nvm use $NODE4 && NODE_ENV=development PORT=$APP_PORT node server"
