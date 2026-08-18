/**
 * Reproduces the Grunt `babel:client` + `sass` steps that `grunt serve` normally
 * performs, writing the results into `.tmp` (which the Express dev server serves
 * ahead of `client/`). This lets the legacy AngularJS client run under a modern
 * Node/Chromium toolchain without touching the source app.
 *
 * Requires babel-core@5 (the version the Gruntfile targets) to be resolvable,
 * e.g. `npm install --prefix ~/legacy-deps babel-core@5.8.38` and
 * `NODE_PATH=~/legacy-deps/node_modules`.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const babel = require('babel-core');

const repoRoot = path.join(__dirname, '..');
const clientDir = path.join(repoRoot, 'client');
const tmpDir = path.join(repoRoot, '.tmp');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (
      entry.name.endsWith('.js') &&
      !entry.name.endsWith('.spec.js') &&
      !entry.name.endsWith('.mock.js')
    ) {
      files.push(full);
    }
  }
  return files;
}

const sources = [path.join(clientDir, 'app'), path.join(clientDir, 'components')].flatMap(dir =>
  walk(dir)
);

for (const file of sources) {
  const relative = path.relative(clientDir, file);
  const target = path.join(tmpDir, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const { code } = babel.transformFileSync(file, { optional: ['es7.classProperties'] });
  fs.writeFileSync(target, code);
}

console.log(`babel: transpiled ${sources.length} client files into .tmp`);
