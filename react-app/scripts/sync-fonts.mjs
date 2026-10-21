import { cpSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Bootstrap glyphicons and Font Awesome ship their fonts inside node_modules;
// copy them into public/fonts so the SCSS font paths resolve at runtime.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const targets = [
  ['node_modules/bootstrap-sass/assets/fonts/bootstrap', 'public/fonts/bootstrap'],
  ['node_modules/font-awesome/fonts', 'public/fonts/font-awesome'],
];

for (const [from, to] of targets) {
  mkdirSync(resolve(root, to), { recursive: true });
  cpSync(resolve(root, from), resolve(root, to), { recursive: true });
}
