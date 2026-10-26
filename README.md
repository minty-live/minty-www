# Daily Minty — marketing site

The public site at [dailyminty.com](https://dailyminty.com): the landing page, pricing, the
learning guides, FAQ, the Xero integration page and a contact form. Next.js 16 (App Router) +
React 19 + TypeScript + Tailwind 4 - the same versions as the app frontends since 2026-10-26 -
deployed on Vercel. There is no backend of its own — the only server
code is the contact endpoint, which sends mail through Microsoft Graph.

```bash
npm install
cp .env.example .env.local     # the NEXT_PUBLIC_* values are optional; the MS_* ones only matter for the contact form
npm run dev                    # http://localhost:3000
```

## Pages

| URL                           | What                                                  | Copy lives in                 |
| ----------------------------- | ----------------------------------------------------- | ----------------------------- |
| `/`                           | landing                                               | `src/config/landing.ts`       |
| `/pricing`                    | plans and module tiles (names and prices: `src/config/pricing.ts`, which mirrors the subscription catalogue) | `src/components/pricing/PricingGrid.tsx` |
| `/resources/learning`         | getting-started guides (YouTube embeds)               | `src/config/get-started.ts`   |
| `/resources/faq`              | FAQ                                                   | `src/config/faq.ts`           |
| `/resources/xero-integration` | how the Xero sync works (in the sitemap, not the nav) | `src/config/xero-integration.ts` |
| `/resources/contact`          | the contact form                                      | `src/components/contact/ContactFormSection.tsx` |
| `/api/contact`                | POST only; validates, rate-limits, sends via Graph    | `src/app/api/contact/route.ts`, `src/lib/graph-mailer.ts` |

The navbar and footer are data: `src/config/nav.ts` and `footer.ts`. `sitemap.ts` and
`robots.ts` are generated from `src/config/site.ts`, which also holds the brand name, tagline,
the waitlist and login URLs and the contact address. Brand colours, fonts, shadows and
animations are Tailwind tokens in the `@theme` block of `src/app/globals.css` (there is no
`tailwind.config.ts` since Tailwind 4).

## Where things are

|                     |                                                                    |
| ------------------- | ------------------------------------------------------------------ |
| `src/app/`          | routes (one folder per URL), `layout.tsx` with the site metadata   |
| `src/components/`   | by page: `landing/`, `pricing/`, `get-started/`, `support/`, `contact/`, `xero/`; shared `layout/` and `ui/` |
| `src/config/`       | page copy and link tables — edit these, not the components         |
| `src/animations/`   | GSAP entrance animations                                           |
| `src/lib/`          | `graph-mailer.ts`, `rate-limit.ts`, `contactRules.ts` (the form's rules, shared with the API), `money.ts` (`HKD 280`), `metadata.ts` (each page's title, canonical and social card), `utils.ts` |
| `scripts/`          | `icons.mjs` - regenerates `src/components/ui/iconPaths.ts` (Material Symbols Rounded) |
| `public/`           | by page: `brand/`, `landing/`, `pricing/`, `guides/`, `support/`, `shared/` |
| `e2e/`              | Playwright tests, see below                                        |
| `docs/`             | `features/` (start here: `site.md`), `contact-form-implementation.md` (how the form works and what is still open), `feedback/`, `archive/` |

## Scripts

|                     |                                                        |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | dev server on 3000                                     |
| `npm run build`     | production build                                       |
| `npm run start`     | serve the production build                             |
| `npm run lint`      | ESLint 9 flat config (`eslint.config.mjs`: Next's core-web-vitals + TypeScript rules) |
| `npm run type-check`| `tsc --noEmit`                                         |
| `npm run test:e2e`  | Playwright — starts its own dev server on 3002         |
| `npm run format`    | Prettier (the app frontends' settings, in `package.json`); CI runs `format:check` |
| `npm run icons`     | regenerate the inlined Material Symbols after adding a name to `scripts/icons.mjs` |

CI (`.github/workflows/ci.yml`) calls the shared `next-web.yml@v1` in
`minty-oliveandvine/.github`: `type-check`, `lint`, a production `build` on Node 24 and
`test:e2e`, on every push to `main` and `development`.

## Testing

`e2e/` holds characterisation tests: every page the navbar, footer and sitemap point at
renders; every internal link resolves; every image and icon a page references is served;
the contact form renders and its API refuses what it should (GET, a cross-site POST, a filled
honeypot, an instant submit) and the form's live validation; the FAQ's tabs and its
`?faqId=<question>` deep link work; each page has its own title and canonical
(`metadata.spec.ts`); prices follow the catalogue and are written `HKD 280` with a
non-breaking space (`pricing.spec.ts`); and at 360, 768 and 1440 px no page scrolls sideways,
no text is under 12px, and every phone tap target is at least 44x44 (`responsive.spec.ts`). The route list is derived from `src/config` and `sitemap.ts`,
so adding a page to either puts it under test. **Nothing ever submits a valid message** —
that would send real mail.

## The contact form

`POST /api/contact` checks origin, rate limit (2/min, 5/10 min, 10/hour per IP), body size,
a honeypot field, a minimum fill time, then validates and sends through Microsoft Graph as
`CONTACT_MAILBOX`. It needs `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET` and
`CONTACT_MAILBOX` in the deployed environment, and the app registration needs `Mail.Send`
consent — `docs/contact-form-implementation.md` has the setup and the open items.

## Env

All variables are listed in `.env.example`; the defaults are in `src/config/site.ts`.

- `WWW_URL` - this site's canonical address (server-side only).
- `WAITLIST_URL` - despite its name, the **Log In** address, inlined into the browser bundle
  through `next.config.mjs`'s `env`. It still points at the old app address on purpose: Log
  In moves to `https://my.dailyminty.com/login` with the November launch, not before
  (`docs/features/site.md`).
- `NEXT_PUBLIC_WAITLIST_FORM_URL`, `NEXT_PUBLIC_CONTACT_EMAIL` - the Join Waitlist form and
  the contact address.
- `MS_*`, `CONTACT_MAILBOX` - server-only, required for the contact form to send.
