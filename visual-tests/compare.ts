import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { SCREENSHOT_ROOT } from './capture';

const THRESHOLD_PCT = Number(process.env.MISMATCH_THRESHOLD ?? '2');
const SOURCE_DIR = path.join(SCREENSHOT_ROOT, 'source');
const REACT_DIR = path.join(SCREENSHOT_ROOT, 'react');
const DIFF_DIR = path.join(SCREENSHOT_ROOT, 'diff');

interface Result {
  name: string;
  mismatchPct: number;
  note?: string;
}

/** Pads a PNG onto a canvas of the given size so differing heights can still be diffed. */
function pad(image: PNG, width: number, height: number): PNG {
  if (image.width === width && image.height === height) {
    return image;
  }
  const canvas = new PNG({ width, height });
  canvas.data.fill(0);
  PNG.bitblt(image, canvas, 0, 0, Math.min(image.width, width), Math.min(image.height, height), 0, 0);
  return canvas;
}

async function compareOne(name: string): Promise<Result> {
  const source = PNG.sync.read(await readFile(path.join(SOURCE_DIR, name)));
  const react = PNG.sync.read(await readFile(path.join(REACT_DIR, name)));

  const width = Math.max(source.width, react.width);
  const height = Math.max(source.height, react.height);
  const a = pad(source, width, height);
  const b = pad(react, width, height);
  const diff = new PNG({ width, height });

  const mismatched = pixelmatch(a.data, b.data, diff.data, width, height, { threshold: 0.1 });
  await writeFile(path.join(DIFF_DIR, name), PNG.sync.write(diff));

  const note =
    source.width === react.width && source.height === react.height
      ? undefined
      : `size ${source.width}x${source.height} vs ${react.width}x${react.height}`;

  return { name, mismatchPct: (mismatched / (width * height)) * 100, note };
}

async function main(): Promise<void> {
  await mkdir(DIFF_DIR, { recursive: true });
  const names = (await readdir(SOURCE_DIR)).filter(file => file.endsWith('.png')).sort();
  const reactNames = new Set(await readdir(REACT_DIR));

  const results: Result[] = [];
  for (const name of names) {
    if (!reactNames.has(name)) {
      throw new Error(`missing react screenshot for ${name}`);
    }
    results.push(await compareOne(name));
  }

  let failures = 0;
  for (const result of results) {
    const passed = result.mismatchPct < THRESHOLD_PCT;
    if (!passed) {
      failures += 1;
    }
    const suffix = result.note ? ` (${result.note})` : '';
    console.log(
      `${passed ? 'PASS' : 'FAIL'}  ${result.name.padEnd(34)} ${result.mismatchPct.toFixed(3)}%${suffix}`
    );
  }

  const worst = results.reduce((max, r) => Math.max(max, r.mismatchPct), 0);
  console.log(
    `\n${results.length - failures}/${results.length} pairs under ${THRESHOLD_PCT}% — worst ${worst.toFixed(3)}%`
  );

  if (failures > 0) {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
