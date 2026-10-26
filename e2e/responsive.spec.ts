import { test, expect, type Page } from '@playwright/test';

// The responsive rules (CLAUDE.md, "Responsive UI rules") at the three QA widths, phone first:
// no horizontal page scroll, no visible text under 12px, and - at phone width - every tap target
// at least 44x44. A link inside a sentence is exempt (WCAG 2.5.8's inline exception).

const PAGES = ['/', '/pricing', '/resources/learning', '/resources/faq', '/resources/contact', '/resources/xero-integration'];
const WIDTHS = [360, 768, 1440];

async function open(page: Page, path: string, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(path, { waitUntil: 'networkidle' });
}

for (const width of WIDTHS) {
  for (const path of PAGES) {
    test(`${path} at ${width}px: no sideways scroll, no text under 12px`, async ({ page }) => {
      await open(page, path, width);
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth, 'page wider than the viewport').toBeLessThanOrEqual(width);

      const tooSmall = await page.evaluate(() => {
        const out: string[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const text = node.textContent?.trim();
          const el = node.parentElement;
          if (!text || !el) continue;
          if (el.closest('.sr-only, [aria-hidden="true"], script, style, noscript')) continue;
          if (el.getClientRects().length === 0) continue; // display: none
          const size = parseFloat(getComputedStyle(el).fontSize);
          if (size < 12) out.push(`${size}px "${text.slice(0, 40)}"`);
        }
        return out;
      });
      expect(tooSmall, 'text under 12px').toEqual([]);
    });
  }
}

for (const path of PAGES) {
  test(`${path} at 360px: every tap target is at least 44x44`, async ({ page }) => {
    await open(page, path, 360);
    const small = await page.evaluate(() => {
      const out: string[] = [];
      const targets = document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [role="button"]');
      for (const el of targets) {
        if (el.closest('[aria-hidden="true"]') || el.getAttribute('tabindex') === '-1') continue;
        if (el.getClientRects().length === 0) continue;
        const style = getComputedStyle(el);
        if (style.visibility === 'hidden' || style.display === 'none') continue;
        // A link inside running text is exempt.
        if (el.tagName === 'A' && el.closest('p, li') && style.display === 'inline') continue;
        const r = el.getBoundingClientRect();
        if (r.height < 43.5 || r.width < 43.5) {
          const label = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('name') || '').trim();
          out.push(`${el.tagName.toLowerCase()} ${Math.round(r.width)}x${Math.round(r.height)} "${label.slice(0, 40)}"`);
        }
      }
      return out;
    });
    expect(small, 'tap targets under 44x44').toEqual([]);
  });
}
