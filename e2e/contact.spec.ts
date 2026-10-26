import { test, expect } from '@playwright/test';

// Each API test posts from its own made-up address (TEST-NET-3), so the route's per-IP rate limit
// never carries over between tests or between runs against a reused dev server.
const fromNewIp = () => `203.0.113.${Math.floor(Math.random() * 254) + 1}`;

// The contact form and its API. NOTHING here submits a valid message:
// src/lib/graph-mailer.ts would call Microsoft Graph with real credentials.
// Every request below is one the route rejects or silently drops BEFORE it
// reaches the mailer (see the numbered steps in src/app/api/contact/route.ts).

test('the form renders with its required fields and a submit button', async ({ page }) => {
  await page.goto('/resources/contact');
  const form = page.locator('form');
  await expect(form).toBeVisible();
  for (const name of ['name', 'email', 'topic', 'message']) {
    await expect(form.locator(`[name="${name}"]`), name).toHaveAttribute('required', '');
  }
  await expect(form.locator('[name="businessName"]')).toBeVisible();
  // The honeypot exists and is hidden from people.
  await expect(form.locator('[name="company"]')).toHaveAttribute('aria-hidden', 'true');
  await expect(form.locator('button[type="submit"]')).toBeEnabled();
});

test('nothing is red when the page opens, and required fields say so to screen readers', async ({ page }) => {
  await page.goto('/resources/contact');
  const form = page.locator('form');
  for (const name of ['name', 'email', 'topic', 'message']) {
    await expect(form.locator(`[name="${name}"]`), name).toHaveAttribute('aria-required', 'true');
    await expect(form.locator(`label[for="${name}"]`), name).toContainText('(required)');
  }
  await expect(form.locator('[aria-invalid="true"]')).toHaveCount(0);
  await expect(form.locator('[id$="-problem"]')).toHaveCount(0);
});

test('an empty submit sends nothing and focuses a summary that links to each field', async ({ page }) => {
  await page.goto('/resources/contact');
  let posted = false;
  page.on('request', (req) => {
    if (req.url().includes('/api/contact')) posted = true;
  });
  await page.locator('form button[type="submit"]').click();

  const summary = page.getByRole('alert').filter({ hasText: 'need another look' });
  await expect(summary).toBeFocused();
  await expect(summary.getByRole('link')).toHaveCount(4);
  for (const name of ['name', 'email', 'topic', 'message']) {
    await expect(page.locator(`form [name="${name}"]`), name).toHaveAttribute('aria-invalid', 'true');
  }
  // The optional field never warns.
  await expect(page.locator('form [name="businessName"]')).not.toHaveAttribute('aria-invalid', 'true');

  await summary.getByRole('link', { name: 'The message is still empty. Tell us how we can help.' }).click();
  await expect(page.locator('form [name="message"]')).toBeFocused();

  // Fixing a field clears its message at once.
  await page.locator('form [name="message"]').fill('Hello');
  await expect(page.locator('#message-problem')).toHaveCount(0);
  await page.waitForTimeout(300);
  expect(posted, 'a POST reached /api/contact').toBe(false);
});

test('clicking Send straight from an unfinished email still submits', async ({ page }) => {
  // Leaving the email field shows its message, which pushes the button down. If that happened
  // on mouse-down, the mouse-up would land beside the button and the click would be lost.
  await page.goto('/resources/contact');
  await page.locator('form [name="email"]').click();
  await page.keyboard.type('minty');
  await page.locator('form button[type="submit"]').click();
  const summary = page.getByRole('alert').filter({ hasText: 'need another look' });
  await expect(summary).toBeFocused();
  await expect(summary.getByRole('link')).toHaveCount(4);
});

test('a refused submit with one problem moves focus to that field', async ({ page }) => {
  await page.goto('/resources/contact');
  await page.locator('form [name="name"]').fill('Minty');
  await page.locator('form [name="email"]').fill('minty@example.com');
  await page.locator('form [name="topic"]').selectOption('Getting started');
  let posted = false;
  page.on('request', (req) => {
    if (req.url().includes('/api/contact')) posted = true;
  });
  await page.locator('form button[type="submit"]').click();
  await expect(page.locator('form [name="message"]')).toBeFocused();
  await expect(page.getByRole('alert').filter({ hasText: 'need another look' })).toHaveCount(0);
  expect(posted).toBe(false);
});

test('an unfinished email is pointed out when the field is left, and clears while typing', async ({ page }) => {
  await page.goto('/resources/contact');
  const email = page.locator('form [name="email"]');
  await email.fill('minty');
  await expect(page.locator('#email-problem'), 'not while still typing').toHaveCount(0);
  await email.blur();
  await expect(page.locator('#email-problem')).toHaveText(
    'This email looks unfinished. Check it reads like name@business.com.',
  );
  await email.fill('minty@example.com');
  await expect(page.locator('#email-problem')).toHaveCount(0);
});

test('a non-English character in the email is refused as it is typed', async ({ page }) => {
  await page.goto('/resources/contact');
  // Click, then type, as a person does: the section fades in, and typing into it unfocused
  // races that animation.
  await page.locator('form [name="email"]').click();
  await page.keyboard.type('mé');
  await expect(page.locator('form [name="email"]')).toHaveValue('m');
  await expect(page.locator('#email-problem')).toHaveText(
    'Email can only contain English letters, numbers and symbols.',
  );
});

test('the API refuses bad fields with 422 and one sentence per field', async ({ request, baseURL }) => {
  // Its own X-Forwarded-For, so this POST does not share the other tests' rate-limit bucket.
  const res = await request.post('/api/contact', {
    headers: { Origin: baseURL!, 'Content-Type': 'application/json', 'X-Forwarded-For': fromNewIp() },
    data: { name: '', email: 'not-an-email', topic: 'nope', message: '', renderedAt: Date.now() - 60_000 },
  });
  expect(res.status()).toBe(422);
  const body = await res.json();
  expect(typeof body.error).toBe('string');
  expect(Object.keys(body.fields).sort()).toEqual(['email', 'message', 'name', 'topic']);
  expect(body).not.toHaveProperty('detail');
});

test('a POST without a fill time is dropped silently', async ({ request, baseURL }) => {
  // The email is malformed on purpose: if the drop ever regressed, validation still stops it
  // before the mailer.
  const res = await request.post('/api/contact', {
    headers: { Origin: baseURL!, 'Content-Type': 'application/json', 'X-Forwarded-For': fromNewIp() },
    data: { name: 'x', email: 'not-an-email', topic: 'Getting started', message: 'x' },
  });
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
});

test('GET /api/contact is not allowed', async ({ request }) => {
  expect((await request.get('/api/contact')).status()).toBe(405);
});

test('a cross-site POST is refused before anything is read', async ({ request }) => {
  const res = await request.post('/api/contact', {
    headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' },
    data: { name: 'x', email: 'x@example.com', topic: 'x', message: 'x' },
  });
  expect(res.status()).toBe(403);
});

test('a filled honeypot is dropped silently', async ({ request, baseURL }) => {
  const res = await request.post('/api/contact', {
    headers: { Origin: baseURL!, 'Content-Type': 'application/json', 'X-Forwarded-For': fromNewIp() },
    data: { name: 'x', email: 'x@example.com', topic: 'x', message: 'x', company: 'bot' },
  });
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
});

test('a form completed instantly is dropped silently', async ({ request, baseURL }) => {
  const res = await request.post('/api/contact', {
    headers: { Origin: baseURL!, 'Content-Type': 'application/json', 'X-Forwarded-For': fromNewIp() },
    data: { name: 'x', email: 'x@example.com', topic: 'x', message: 'x', renderedAt: Date.now() },
  });
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
});
