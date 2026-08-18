import { chromium } from 'playwright';

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  p.on('console', m => console.log('CONSOLE', m.type(), m.text().slice(0, 300)));
  p.on('pageerror', e => console.log('PAGEERROR', String(e).slice(0, 500)));
  p.on('requestfailed', r => console.log('REQFAIL', r.url(), r.failure()?.errorText));
  await p.goto('http://localhost:9000/', { waitUntil: 'load' });
  await p.waitForTimeout(4000);
  console.log('boxes', await p.locator('.product-box').count());
  console.log('navlis', await p.locator('.navbar li').count());
  await b.close();
})();
