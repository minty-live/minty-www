# Contact Form — Implementation Report

**Scope:** Wiring the `/resources/contact` form to deliver submissions into an Outlook
mailbox via the Microsoft Graph API.
**Status:** Code complete. **Not yet verified against a live send** — see
[Outstanding work](#outstanding-work). Validation reworked 2026-10-26 (sections 3.2 and 3.3).

---

## 1. Starting point

The contact page rendered a complete-looking form, but it was inert:

- No `onSubmit` handler and no `action` attribute — submitting reloaded the page.
- Inputs had no `name` attributes, so no values would have been serialised anyway.
- The **Topic** dropdown contained a single placeholder option (`Pick one..`).
- No backend existed — the project had no `src/app/api/` directory at all.

The goal was to make submissions arrive in a monitored mailbox without introducing a
third-party form service.

---

## 2. Architecture

```
ContactFormSection.tsx      POST /api/contact         graph-mailer.ts
  (client component)   ──▶   route.ts (server)   ──▶   Microsoft Graph  ──▶  Outlook
   validates + UI            validates + rate-shapes    OAuth2 + sendMail        mailbox
```

Three layers, each with a single responsibility:

| Layer     | File                                            | Responsibility                                               |
| --------- | ----------------------------------------------- | ------------------------------------------------------------ |
| UI        | `src/components/contact/ContactFormSection.tsx` | Collect input, manage submit state, surface errors           |
| API       | `src/app/api/contact/route.ts`                  | Validate, reject spam, translate failures into safe messages |
| Transport | `src/lib/graph-mailer.ts`                       | Acquire Graph token, compose and send the mail               |

Credentials live only in the transport layer, which is server-only. The browser never
receives them.

---

## 3. Implementation detail

### 3.1 Transport — `src/lib/graph-mailer.ts`

Uses the **OAuth2 client-credentials flow** (app-only, no signed-in user):

1. `POST https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`
   with `scope=https://graph.microsoft.com/.default`.
2. `POST https://graph.microsoft.com/v1.0/users/{mailbox}/sendMail` with a bearer token.

Notable choices:

- **No SDK.** Implemented with plain `fetch` rather than `@azure/msal-node` or the Graph
  client. Two HTTP calls did not justify the dependency weight.
- **Module-scope token cache.** Tokens last ~60 minutes; they are cached and refreshed
  60 seconds early to avoid racing the expiry. Warm serverless invocations skip the token
  round trip entirely.
- **`import 'server-only'`.** The only dependency added (`server-only@0.0.1`, ~1 KB). It
  makes the **build fail loudly** if this module is ever imported into client code — a
  guardrail against leaking `MS_CLIENT_SECRET` into a browser bundle.
- **`replyTo` set to the submitter.** Mail arrives _from_ the shared mailbox, but hitting
  Reply in Outlook addresses the person who filled the form.
- **HTML escaping.** All user-supplied values pass through `escapeHtml()` before being
  interpolated into the HTML mail body, preventing markup injection into the email.
- **Fail-fast config.** `readEnv()` throws listing every missing variable by name, rather
  than failing obscurely at request time.

### 3.2 API — `src/app/api/contact/route.ts`

- Pinned to `runtime = 'nodejs'`.
- **One rule set, two users (2026-10-26):** `src/lib/contactRules.ts` holds the fields, the
  required ones (`name`, `email`, `topic`, `message`; `businessName` is optional), the length
  caps (`message` 5000, `name` 100, ...), the topic list and every message. The form checks them
  as you type; the route is the gate.
- **Refusals use the house envelope:** `422 {"error": "<sentence>", "fields": {"<field>":
"<sentence>"}}`, never `detail`. Every sentence follows Part 11 (what is wrong, then what to
  do), e.g. "The message is still empty. Tell us how we can help." A topic outside the list is
  refused too. The other replies are sentences as well: 403/400 "We couldn't read that
  message...", 413, 429 (with `Retry-After`), 500 "Your message didn't send...".
- Email is English only (2026-10-01): a non-ASCII address is refused with "Email can only
  contain English letters, numbers and symbols.". The rules are in `src/lib/email.ts`. The form's
  field uses `useEmailInput` (`src/lib/emailInput.ts`): it is `type="text" inputMode="email"`,
  and it drops non-ASCII once an IME composition ends and shows the same sentence. The
  browser's `type="email"` had let Korean through after the "@".
- **Honeypot:** a hidden `company` field. Real users leave it empty; bots fill it. When
  populated the route returns `{ ok: true }` _without sending_ — the bot sees success and
  does not retry.
- **Fill time:** the form sends `renderedAt` (when it became fillable). Under three seconds -
  or no usable `renderedAt` at all - is dropped the same silent way. Until 2026-10-26 a body
  WITHOUT `renderedAt` skipped this check entirely, so any script that left it out passed.
- **Error handling is asymmetric by design:** the full Graph error is logged server-side
  via `console.error`, while the client receives a generic message. Graph errors can
  contain tenant and mailbox detail that should not reach the browser.

### 3.3 UI — `src/components/contact/ContactFormSection.tsx`

Converted to a client component (`'use client'`) with a four-state machine:
`idle → sending → sent | error`.

- Submit button disables and reads `Sending…` during flight.
- Success replaces the form with a confirmation panel and a "Send another message" reset.
- Errors render in an inline banner above the button; the user's input is preserved.
- The **Topic** dropdown was populated with five options, defined in the `TOPICS` array at
  the top of the file. Edit that array to change them.
- **Validation as you type (2026-10-26, the house rule).** The form is `noValidate`: it
  checks `contactRules.ts` itself.
  - A problem you can see while typing (a non-English character) shows at once; one that
    only means "not finished yet" (an email without its domain) waits until you leave the
    field. Each message clears the moment the field is fixed.
  - Required fields: a red `*` (aria-hidden) plus a screen-reader-only "(required)" in the
    label, and `aria-required` on the control. An empty field is never red until a refused
    submit. `Business name` is optional and never warns.
  - A refused submit with two or more problems shows a summary above the form that takes
    focus and links to each field; with one problem, focus moves to that field.
  - Problems are wired with `aria-invalid` and `aria-describedby`; a 422's `fields` show under
    their inputs the same way.
  - The inputs are uncontrolled, so text typed before hydration (a slow phone) is kept; submit
    reads the form itself.
  - Rate-limited: the button is disabled and says why beside it, not only in a tooltip.
- **Copy:** the reply time is one promise, `siteConfig.replyPromise` ("We reply within one
  business day."), on the form and the email card; the hard-coded "All systems normal" card
  was removed (it was never real). The privacy link goes to minty-web's live
  `/privacy` (`siteConfig.privacyUrl`).
- Added `id`/`name`/`htmlFor` pairs and `required`/`maxLength` attributes throughout —
  these were previously absent, so the fields were also not accessible to screen readers.

---

## 4. Configuration

Four server-side variables:

| Variable           | Purpose                                     |
| ------------------ | ------------------------------------------- |
| `MS_TENANT_ID`     | Azure AD tenant (directory) ID              |
| `MS_CLIENT_ID`     | App registration client ID                  |
| `MS_CLIENT_SECRET` | App registration client secret              |
| `CONTACT_MAILBOX`  | Mailbox to send **from** and deliver **to** |

None are prefixed `NEXT_PUBLIC_`, so Next.js will not expose them to the client bundle.

**Local:** stored in `.env.local`, which is gitignored via `.gitignore:29` (`.env*.local`).
Verified with `git check-ignore` — the secret is not tracked.

**Deployment:** `.env.local` is local-only. The four variables must be added to the hosting
provider's environment settings (e.g. Vercel project settings) or sending will fail in
production.

### Azure prerequisite

The app registration requires the **`Mail.Send` _Application_ permission** (not Delegated),
with **admin consent granted**. Without it Graph returns `403 ErrorAccessDenied`.

> Azure Portal → App registrations → _app_ → API permissions → Add → Microsoft Graph →
> Application permissions → `Mail.Send` → Add → **Grant admin consent**

Note that `Mail.Send` at application scope grants the ability to send as _any_ mailbox in
the tenant. Scoping it down with an ApplicationAccessPolicy limited to `CONTACT_MAILBOX` is
recommended but not currently configured.

---

## 5. Security notes

| Concern                   | Handling                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------- |
| Secret in client bundle   | Prevented by `server-only` + no `NEXT_PUBLIC_` prefix                                   |
| Secret in git             | `.env.local` gitignored; verified via `git check-ignore`                                |
| HTML injection into email | All values escaped via `escapeHtml()`                                                   |
| Bot spam                  | Honeypot field, a minimum fill time (a missing one counts as a bot), per-IP rate limits |
| Oversized payloads        | Length caps enforced server-side, not just in the DOM                                   |
| Internal detail leakage   | Graph errors logged server-side only; client gets a generic message                     |

**Credential hygiene:** the client secret was transmitted in plaintext during development
setup and is present in shell/editor history. Rotating it in Azure and updating both
`.env.local` and the host environment is advised.

---

## 6. Verification performed

- `tsc --noEmit` passes clean.
- `git check-ignore` confirms `.env.local` is untracked.
- Working tree matches `HEAD` — no uncommitted drift.

**Not performed:** no live submission has been sent end-to-end. The Azure admin-consent
step above is a prerequisite, so the Graph call is unproven until that is granted and a
real submission is tested.

---

## 7. Outstanding work

| Item                                                | Notes                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Grant `Mail.Send` admin consent**                 | Blocking — nothing sends until this is done                                                                                                                                                                                                                                                                                                                                                                                     |
| **Test a live submission**                          | Confirms token flow, permission, and delivery together                                                                                                                                                                                                                                                                                                                                                                          |
| **Add env vars to the deploy host**                 | Production will fail without them                                                                                                                                                                                                                                                                                                                                                                                               |
| ~~`.env.example` does not document the Graph vars~~ | Done 2026-09-17 — all four are listed with placeholders.                                                                                                                                                                                                                                                                                                                                                                        |
| ~~Rate limiting~~                                   | Done — `src/lib/rate-limit.ts`, three windows (2/min, 5/10 min, 10/hour) applied in the route before the body is read.                                                                                                                                                                                                                                                                                                          |
| ~~Privacy policy link~~                             | Done 2026-10-26 — minty-web's `https://my.dailyminty.com/privacy`                                                                                                                                                                                                                                                                                                                                                               |
| Rate-limit key trusts `X-Forwarded-For`             | `src/lib/rate-limit.ts` takes its left-most entry. Correct behind Vercel, which sets the header itself; on any other host a client could pick its own bucket.                                                                                                                                                                                                                                                                   |
| Confirmation email to submitter                     | Not implemented — submitters get no receipt                                                                                                                                                                                                                                                                                                                                                                                     |
| Automated tests                                     | `e2e/contact.spec.ts` covers the form rendering, the live messages (unfinished email on leave, non-English characters while typing), the error summary and its links, single-problem focus, the 422 envelope, and the route's origin, honeypot, fill-time and missing-fill-time drops — everything short of a real send. Nothing exercises a valid submission, by design: every API test body keeps at least one invalid field. |
| ~~`src/components/contact/ContactForm.tsx`~~        | Deleted 2026-09-17.                                                                                                                                                                                                                                                                                                                                                                                                             |

---

## 8. Files changed

| File                                            | Change                                                            |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| `src/lib/graph-mailer.ts`                       | **New** — Graph token acquisition and send                        |
| `src/app/api/contact/route.ts`                  | **New** — validation and submission endpoint                      |
| `src/components/contact/ContactFormSection.tsx` | Wired to the API; added state, topics, honeypot, field attributes |
| `.env.local`                                    | **New**, gitignored — real credentials                            |
| `package.json` / `package-lock.json`            | Added `server-only@0.0.1`                                         |
