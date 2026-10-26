# The marketing site

## Stack

Next.js 16 (App Router), React 19, TypeScript ~6.0, Tailwind 4: the app frontends' versions
since 2026-10-26, when the owner lifted the 2026-10-12 hold on Next 14 / Tailwind 3. The v3→v4
move was checked by diffing every element's computed style on all six pages, before and after.
Two v4 behaviour changes needed compat rules, both in `src/app/globals.css`'s base layer and
`md:leading-*` classes:
- buttons get the pointer cursor back;
- an explicit `leading-*` now beats the line-height that comes with a `md:text-*` size, so four
  blocks carry `md:leading-*`.

Tokens (colours, the two font stacks, shadows, gradients, animations) live in the `@theme`
block of `globals.css`. There is no `tailwind.config.ts`. Plus Jakarta Sans is the body face
here, the site's documented exception, self-hosted through `next/font` (`src/app/layout.tsx`).

## Pages and metadata

Every route is a server component that exports its own metadata through
`src/lib/metadata.ts`'s `pageMetadata`: its own title, description, canonical, and a full
Open Graph / Twitter card whose URL is the page itself. Next replaces a parent's `openGraph`
rather than merging it, which is why the helper writes the whole card. The layout sets no
canonical. Until 2026-10-26, four client-component pages (pricing, learning, FAQ, contact)
inherited the layout's, which told search engines they were copies of the homepage.
`e2e/metadata.spec.ts` holds this.

Interactive parts are client components below the page. The FAQ reads `?faqId=<question>`
itself (`FaqCategories`, inside a Suspense boundary).

The social card is `public/og-image.png`, a true 1200×630 PNG cropped from the hero art.

## Links

All in `src/config/site.ts`:

| What | Where it goes |
|---|---|
| Join Waitlist (every primary CTA) | the ClickUp form, `NEXT_PUBLIC_WAITLIST_FORM_URL` |
| Log In (navbar, phone menu, learning hero) | `WAITLIST_URL` - **held on the old app address until November** (below) |
| Terms, Privacy (footer, contact form) | minty-web's public pages, `https://my.dailyminty.com/terms` and `/privacy` |
| Contact | `mailto:hello@dailyminty.com`, WhatsApp, the contact page |

### Held until November (owner, 2026-10-26)

Log In keeps pointing at `https://www.minty.oliveandvinehk.com/`, and the CTAs stay "Join
Waitlist", until the full November launch. At the cutover (`minty-infra/CUTOVER.md` §7, step 4):
- point Log In at `https://my.dailyminty.com/login`;
- rename `WAITLIST_URL` (which is the Log In address, despite its name) to `HUB_URL` in
  `site.ts`, `next.config.mjs`'s `env` and `.env.example`;
- set it in Vercel's production env.

## Pricing and money

`src/config/pricing.ts` mirrors the subscription catalogue (`Minty/docs/schema/seed_catalogue.sql`):
- Petty Cash and Payment Request at HKD 280 a month each;
- Super Minty (both) at HKD 400;
- a 30-day trial.

The pricing cards, the page description and the JSON-LD offer all read it. A price, name or
trial change goes in the database, that file and this one.

Amounts go through `src/lib/money.ts`'s `formatPrice`: `HKD 280`, with the ISO code, a
non-breaking space and no trailing `.00`. That is `@minty/shared/money`'s output, copied
because this site does not depend on the package. `e2e/pricing.spec.ts` holds the names and the
format, and refuses `$`/`HK$`.

## Design rules applied

- **Primary CTA:** Minty Action `bg-cta` (`#3CBCC3`), hover `cta-hover`, pressed `cta-pressed`,
  with a white label at least 14px SemiBold (`components/ui/Button.tsx`'s `primary`/`waitlist`,
  the navbar, the contact and support buttons). Brand `#54D3DA` is only the browser theme colour.
- **Buttons** have radius 12 (`rounded-xl`) and are never pills. Round icon-only buttons and the
  small eyebrow chips stay round.
- **Text** is at least 12px. **Tap targets** are at least 44×44 at phone width.
- **Contrast:** `teal-deep` (`#0b7a6e`) and `ink-muted` (`#5a6d75`) were darkened 2026-10-26 to
  pass WCAG AA for small text. Greys are `gray-600`/`500`, never `400`, for text.
- **Keyboard focus** is visible everywhere (a base `:focus-visible` outline); the form fields
  draw their own teal ring.
- **Icons** are Material Symbols Rounded, weight 400, inlined as path data by `ui/Icon.tsx`
  from `ui/iconPaths.ts`, which `npm run icons` regenerates from `@material-symbols/svg-400`.
  The 3.96 MB icon font is never loaded. lucide-react was removed 2026-10-26.
- **Headings:** one h1 a page, no skipped levels.

## Tests

`npm run test:e2e` (Playwright, 3002) covers:
- `pages`: every page renders.
- `links`: every internal link resolves.
- `assets`: every image is served.
- `learning`: the guide curriculum.
- `faq`: the tabs and the deep link.
- `contact`: see the contact doc.
- `metadata`.
- `pricing`.
- `responsive`: at 360, 768 and 1440, no sideways scroll and no text under 12px; at 360, every
  tap target is at least 44×44.

There are no unit tests. CI runs type-check, lint, `format:check` (Prettier, the app frontends'
settings), a production build and the e2e specs through the shared `next-web.yml@v1`.

## Open items

- **FAQ copy** (`src/config/faq.ts`) reads like placeholder text in places ("inactive
  sequence", "historical ledger lock error"); it needs the owner's rewrite.
- **Brand accents in headlines:** "Minty." and "clear again." are `#00CBB0`/`#00cbb2`, under
  3:1 on white even for large text. Darkening them is a brand decision.
- **The white-on-teal Super Minty card** (`#01d0c1`) and the Xero blue `#2baae0` word are under
  AA. The first is a design choice, the second the partner's brand colour.
- **The hero art's app screenshot** shows amounts as `HK$ 1,500.00`, the old symbol format. It
  is part of the image, so it needs a new export.
