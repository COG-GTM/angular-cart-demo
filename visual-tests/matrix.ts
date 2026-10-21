import type { Page } from 'playwright';

export type ViewportName = 'desktop' | 'mobile';

export interface Viewport {
  name: ViewportName;
  width: number;
  height: number;
}

export const VIEWPORTS: Viewport[] = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 375, height: 812 },
];

export interface ViewCase {
  /** File-name prefix for the captured screenshot. */
  name: string;
  /** Route to open, relative to the app base url. */
  path: string;
  /** Restrict the case to a subset of viewports. */
  viewports?: ViewportName[];
  /** Interactions performed after the route has settled, before the screenshot. */
  setup?: (page: Page) => Promise<void>;
}

/** Adds a product to the cart by its position in the (name-ordered) grid. */
async function addToCart(page: Page, index: number): Promise<void> {
  await page.locator('.product-box').nth(index).locator('button:visible').click();
}

/**
 * Navigates to the cart in-app (the cart lives in memory, so a reload would
 * drop it). Below the bootstrap breakpoint the nav links sit inside the
 * collapsed menu, so the viewport is widened for the click and restored after.
 */
async function openCartFromNavbar(page: Page): Promise<void> {
  const viewport = page.viewportSize();
  const collapsed = await page.locator('.navbar-toggle').isVisible();
  if (collapsed && viewport) {
    await page.setViewportSize({ width: 1280, height: viewport.height });
  }
  await page.locator('.navbar a[href="/cart"]').click();
  await page.waitForFunction(() => window.location.pathname === '/cart');
  if (collapsed && viewport) {
    await page.setViewportSize(viewport);
  }
}

/**
 * Screenshot matrix derived from the AngularJS app's ui-router states:
 * `products` (url `/`) and `cart` (url `/cart`), plus their key UI states.
 */
export const VIEWS: ViewCase[] = [
  {
    name: 'products',
    path: '/',
  },
  {
    name: 'products-search',
    path: '/',
    setup: async page => {
      await page.fill('#search-text', 'dress');
    },
  },
  {
    name: 'products-in-cart',
    path: '/',
    setup: async page => {
      await addToCart(page, 1);
      await addToCart(page, 1);
      await addToCart(page, 4);
    },
  },
  {
    name: 'cart-empty',
    path: '/cart',
  },
  {
    name: 'cart-items',
    path: '/',
    setup: async page => {
      await addToCart(page, 1);
      await addToCart(page, 1);
      await addToCart(page, 4);
      await addToCart(page, 6);
      await openCartFromNavbar(page);
    },
  },
];

export function viewportsFor(view: ViewCase): Viewport[] {
  return VIEWPORTS.filter(vp => !view.viewports || view.viewports.includes(vp.name));
}
