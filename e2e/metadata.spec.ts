import { test, expect } from "@playwright/test";
import { siteConfig } from "../src/config/site";

// Every page names itself to search engines: its own <title>, its own description and a
// canonical that points at ITSELF. Four pages were client components, which cannot export
// metadata, so they inherited the layout's - "Daily Minty", and a canonical pointing at the
// homepage, which tells Google they are duplicates of it.

const PAGES: { path: string; title: string }[] = [
  { path: "/", title: "Daily Minty" },
  { path: "/pricing", title: "Pricing | Daily Minty" },
  { path: "/resources/learning", title: "Learning | Daily Minty" },
  { path: "/resources/faq", title: "FAQ | Daily Minty" },
  { path: "/resources/contact", title: "Contact | Daily Minty" },
  { path: "/resources/xero-integration", title: "Xero Integration | Daily Minty" },
];

const descriptions = new Map<string, string>();

for (const { path, title } of PAGES) {
  test(`${path} has its own title, description and canonical`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toBe(path === "/" ? siteConfig.url : `${siteConfig.url}${path}`);
    expect(await page.locator('meta[property="og:url"]').getAttribute("content")).toBe(canonical);

    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description, "a description").toBeTruthy();
    for (const [other, seen] of descriptions) {
      expect(description, `same description as ${other}`).not.toBe(seen);
    }
    descriptions.set(path, description!);
  });
}
