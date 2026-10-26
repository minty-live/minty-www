import { test, expect } from "@playwright/test";

// /resources/faq: three tabs, and a deep link `?faqId=<the question, URL-encoded>` that opens the
// tab holding that question with the question expanded. Nothing on this site builds such a link,
// but links from outside (mail, chat, the apps) may - this pins that behaviour.

const PATH = "/resources/faq";
const BEGINNER = "not-finished";
const INTERMEDIATE = "split-shifts";
const INTERMEDIATE_QUESTION = "How do I balance split-shifts or mid-day drawer handoffs?";

const toggle = (page: import("@playwright/test").Page, id: string) =>
  page.locator(`#faq-${id} button[aria-expanded]`);

test("with no deep link the first tab shows, nothing expanded", async ({ page }) => {
  await page.goto(PATH);
  await expect(toggle(page, BEGINNER)).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(`#faq-${INTERMEDIATE}`)).toHaveCount(0);
});

test("a deep link opens its tab with the question expanded", async ({ page }) => {
  await page.goto(`${PATH}?faqId=${encodeURIComponent(INTERMEDIATE_QUESTION)}`);
  await expect(toggle(page, INTERMEDIATE)).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(`#faq-${BEGINNER}`)).toHaveCount(0);
});

test("a deep-linked question can be closed", async ({ page }) => {
  await page.goto(`${PATH}?faqId=${encodeURIComponent(INTERMEDIATE_QUESTION)}`);
  await expect(toggle(page, INTERMEDIATE)).toHaveAttribute("aria-expanded", "true");
  await toggle(page, INTERMEDIATE).click();
  await expect(toggle(page, INTERMEDIATE)).toHaveAttribute("aria-expanded", "false");
});

test("a deep link to no question falls back to the first tab", async ({ page }) => {
  await page.goto(`${PATH}?faqId=${encodeURIComponent("No such question")}`);
  await expect(toggle(page, BEGINNER)).toHaveAttribute("aria-expanded", "false");
});

test("a question toggles, and switching tabs swaps the list", async ({ page }) => {
  await page.goto(PATH);
  await toggle(page, BEGINNER).click();
  await expect(toggle(page, BEGINNER)).toHaveAttribute("aria-expanded", "true");
  await toggle(page, BEGINNER).click();
  await expect(toggle(page, BEGINNER)).toHaveAttribute("aria-expanded", "false");

  await page.getByRole("button", { name: /intermediate/i }).click();
  await expect(toggle(page, INTERMEDIATE)).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(`#faq-${BEGINNER}`)).toHaveCount(0);
});

test("a malformed deep link does not break the page", async ({ page }) => {
  await page.goto(`${PATH}?faqId=100%`);
  await expect(toggle(page, BEGINNER)).toHaveAttribute("aria-expanded", "false");
});
