import { mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { chromium, type Browser, type Page } from 'playwright';
import { VIEWS, viewportsFor } from './matrix';

export const SCREENSHOT_ROOT = path.join(__dirname, 'screenshots');

const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'products.json');

const FREEZE_CSS = `*, *::before, *::after {
  transition: none !important;
  animation: none !important;
  caret-color: transparent !important;
}`;

export interface AppTarget {
  /** Sub-directory under screenshots/, e.g. "source" or "react". */
  id: string;
  baseUrl: string;
}

async function fixtureBody(): Promise<string> {
  return readFile(FIXTURE_PATH, 'utf8');
}

/** Serves identical product data to both apps so diffs only reflect rendering. */
async function mockApi(page: Page, body: string): Promise<void> {
  await page.route('**/api/products**', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body })
  );
}

async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

export async function captureApp(target: AppTarget): Promise<void> {
  const outDir = path.join(SCREENSHOT_ROOT, target.id);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const body = await fixtureBody();
  const browser: Browser = await chromium.launch();

  try {
    for (const view of VIEWS) {
      for (const viewport of viewportsFor(view)) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          deviceScaleFactor: 1,
          reducedMotion: 'reduce',
        });
        const page = await context.newPage();
        await mockApi(page, body);
        await page.goto(`${target.baseUrl}${view.path}`, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.navbar');
        await settle(page);
        if (view.setup) {
          await view.setup(page);
          await settle(page);
        }
        // Freeze transitions/animations last so interactive setup (navbar
        // collapse) still animates to its final state.
        await page.addStyleTag({ content: FREEZE_CSS });
        await page.waitForTimeout(200);
        const file = path.join(outDir, `${view.name}-${viewport.name}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log(`captured ${target.id}/${path.basename(file)}`);
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
