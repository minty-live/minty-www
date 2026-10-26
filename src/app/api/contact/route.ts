import { NextResponse } from "next/server";
import { sendContactEmail, type ContactSubmission } from "@/lib/graph-mailer";
import { contactProblems, type ContactValues } from "@/lib/contactRules";
import { check, clientIp } from "@/lib/rate-limit";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";

// Replies follow the house envelope: {"error": "<sentence>"}, plus `fields` (one sentence per
// input) when input is refused, with 422. Sentences follow Part 11 - what is wrong, then what to
// do - and the form shows them as they are.
const UNREADABLE = "We couldn't read that message. Refresh the page and send it again.";
const NOT_SENT = `Your message didn't send. Try again, or email us at ${siteConfig.contactEmail}.`;
const TOO_LARGE = "The message is too long to send. Shorten it and send it again.";
const FIX_FIELDS =
  "Some details need another look. Check the highlighted fields and send it again.";

// Mirrors the client-side limits (which are only a UX guard) so the server never
// rejects something the UI just promised, then adds an hourly ceiling the client
// does not enforce — that one is the real backstop against sustained abuse.
const RULES = [
  { limit: 2, windowMs: 60 * 1000 }, // burst: 2 per minute
  { limit: 5, windowMs: 10 * 60 * 1000 }, // matches the form's 5 per 10 minutes
  { limit: 10, windowMs: 60 * 60 * 1000 }, // ceiling: 10 per hour
];

/** Reject bodies large enough to be an attack rather than a message. */
const MAX_BODY_BYTES = 20_000;

/** A human cannot fill this form in under three seconds. */
const MIN_FILL_MS = 3_000;

/** Generic reply for anything we silently drop, so probes learn nothing. */
const SILENT_OK = { ok: true };

function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  // Same-origin form posts from some browsers omit Origin; allow only if there is
  // also no cross-site referer. Anything with a foreign Origin is rejected.
  if (!origin) return true;

  try {
    const host = request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** The same rules the form checks as you type (lib/contactRules.ts) - here they are the gate. */
function validate(body: Record<string, unknown>): {
  data?: ContactSubmission;
  fields?: Partial<Record<keyof ContactValues, string>>;
} {
  const get = (key: string) => (typeof body[key] === "string" ? (body[key] as string).trim() : "");

  const data: ContactValues = {
    name: get("name"),
    email: get("email"),
    businessName: get("businessName"),
    topic: get("topic"),
    message: get("message"),
  };

  const fields = contactProblems(data);
  return Object.keys(fields).length ? { fields } : { data };
}

export async function POST(request: Request) {
  const ip = clientIp(request);

  // 1. Reject cross-site posts outright.
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: UNREADABLE }, { status: 403 });
  }

  // 2. Rate limit before doing any work, so floods stay cheap to reject.
  const { allowed, retryAfter } = check(`contact:${ip}`, RULES);
  if (!allowed) {
    const mins = Math.ceil(retryAfter / 60);
    return NextResponse.json(
      {
        error:
          retryAfter > 90
            ? `You've sent several messages recently. Please try again in about ${mins} minute${
                mins === 1 ? "" : "s"
              }, or email us directly.`
            : `Please wait ${retryAfter} seconds before sending another message.`,
      },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  // 3. Refuse oversized payloads without buffering them.
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: TOO_LARGE }, { status: 413 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: TOO_LARGE }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: UNREADABLE }, { status: 400 });
  }

  // 4. Honeypot — real users never see this field, bots fill everything.
  if (typeof body.company === "string" && body.company.length > 0) {
    console.warn("[contact] honeypot triggered", { ip });
    return NextResponse.json(SILENT_OK);
  }

  // 5. Timing check — a form completed instantly was not typed by a person. The form always
  // sends renderedAt, so a body without a usable one did not come from it: dropped too. (Until
  // 2026-10-26 a missing renderedAt skipped this check entirely.)
  const renderedAt = Number(body.renderedAt);
  const elapsed = Date.now() - renderedAt;
  if (!Number.isFinite(renderedAt) || renderedAt <= 0 || elapsed < MIN_FILL_MS) {
    console.warn("[contact] submitted too fast or without a fill time", { ip, elapsed });
    return NextResponse.json(SILENT_OK);
  }

  const { data, fields } = validate(body);
  if (!data) {
    return NextResponse.json({ error: FIX_FIELDS, fields }, { status: 422 });
  }

  try {
    await sendContactEmail(data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] send failed:", err);
    return NextResponse.json({ error: NOT_SENT }, { status: 500 });
  }
}

/** Anything other than POST is not a valid way to reach this endpoint. */
export async function GET() {
  return NextResponse.json(
    { error: "This address only takes messages sent from the contact form." },
    { status: 405 },
  );
}
