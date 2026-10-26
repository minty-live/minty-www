"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "@/components/ui/Icon";
import AnimatedContent from "@/animations/landing/heroanim";
import { useEmailInput } from "@/lib/emailInput";
import { EMAIL_ASCII_HINT } from "@/lib/email";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import {
  CONTACT_FIELDS,
  FIELD_LABELS,
  MAX_LENGTHS,
  REQUIRED,
  SUMMARY_LEAD,
  TOPICS,
  contactProblems,
  fieldProblem,
  type ContactField,
  type ContactValues,
} from "@/lib/contactRules";

// Rate limiting: at most MAX_SUBMISSIONS within WINDOW_MS, plus a COOLDOWN_MS
// gap between any two sends. Timestamps persist so a page reload can't reset it.
const STORAGE_KEY = "minty:contact:submissions";
const MAX_SUBMISSIONS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const COOLDOWN_MS = 30 * 1000; // 30 seconds between sends

type Status = "idle" | "sending" | "sent" | "error";

/** Reads submission timestamps, dropping any that fall outside the window. */
function readRecentSubmissions(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - WINDOW_MS;
    return parsed.filter((t): t is number => typeof t === "number" && t > cutoff);
  } catch {
    // Corrupt or unavailable storage (e.g. Safari private mode) — fail open.
    return [];
  }
}

/** The recent submissions plus one made now. */
function withThisSubmission(): number[] {
  return [...readRecentSubmissions(), Date.now()];
}

function recordSubmission(timestamps: number[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(timestamps));
  } catch {
    // Storage unavailable — in-memory state still guards this session.
  }
}

export default function ContactFormSection() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [values, setValues] = useState<ContactValues>(EMPTY_VALUES);
  // Fields the person has left at least once (an unfinished email is only pointed out then).
  const [left, setLeft] = useState<Partial<Record<ContactField, boolean>>>({});
  // Set by a refused submit: from then on empty required fields show their message and red line.
  const [submitted, setSubmitted] = useState(false);
  const [serverFields, setServerFields] = useState<Partial<Record<ContactField, string>>>({});
  // Bumped by each refused submit with two or more problems, so the summary takes focus again.
  const [summaryTurn, setSummaryTurn] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const setField = (field: ContactField, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setServerFields((f) => ({ ...f, [field]: undefined }));
  };
  const emailInput = useEmailInput((value) => setField("email", value));
  // Uncontrolled inputs: text typed before hydration (a slow phone) survives, which a controlled
  // input would reset. `values` follows every change for the live messages; submit reads the form.
  const readForm = (): ContactValues => {
    const data = formRef.current ? new FormData(formRef.current) : null;
    const get = (f: ContactField) => String(data?.get(f) ?? "");
    return {
      name: get("name"),
      email: get("email"),
      businessName: get("businessName"),
      topic: get("topic"),
      message: get("message"),
    };
  };
  const [submissions, setSubmissions] = useState<number[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  // When the form became fillable — the server rejects implausibly fast submits.
  const renderedAt = useRef<number>(0);

  // Hydrate from storage after mount so server and client markup match. Reading browser storage
  // once mounted is the external-system sync the rule allows: a lazy initial state would read it
  // during the server render too, and the markup would mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
    setSubmissions(readRecentSubmissions());
    // Anything typed before hydration, so the live messages start from what is on screen.
    setValues(readForm());
    renderedAt.current = Date.now();
  }, []);

  const lastSubmission = submissions.length ? Math.max(...submissions) : 0;
  const hitLimit = submissions.length >= MAX_SUBMISSIONS;

  // Tick down whichever block is active, so the UI re-enables on its own.
  useEffect(() => {
    if (!lastSubmission && !hitLimit) return;

    const tick = () => {
      const now = Date.now();
      const cooldownEnds = lastSubmission + COOLDOWN_MS;
      // When the cap is hit, the block lasts until the oldest entry ages out.
      const windowEnds = hitLimit ? Math.min(...submissions) + WINDOW_MS : 0;
      const until = Math.max(cooldownEnds, windowEnds);
      const remaining = Math.ceil((until - now) / 1000);

      if (remaining <= 0) {
        setSecondsLeft(0);
        // Re-read to drop entries that have aged out of the window.
        setSubmissions(readRecentSubmissions());
        return;
      }
      setSecondsLeft(remaining);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastSubmission, hitLimit, submissions]);

  const isRateLimited = secondsLeft > 0;

  const limitMessage = useCallback(() => {
    if (hitLimit) {
      const mins = Math.ceil(secondsLeft / 60);
      return `You've sent ${MAX_SUBMISSIONS} messages recently. Please wait ${mins} minute${
        mins === 1 ? "" : "s"
      } before sending another, or email us directly.`;
    }
    return `Please wait ${secondsLeft} second${secondsLeft === 1 ? "" : "s"} before sending another message.`;
  }, [hitLimit, secondsLeft]);

  /** The message a field shows now: as you type, once left, and everything after a refused submit. */
  const problemOf = (field: ContactField): string | null =>
    // The hook strips a non-English character as it is typed, so the value no longer holds it:
    // its `rejected` flag is what says one was refused.
    (field === "email" && emailInput.rejected ? EMAIL_ASCII_HINT : null) ??
    fieldProblem(field, values[field], submitted ? "submitted" : left[field] ? "left" : "typing") ??
    serverFields[field] ??
    null;

  const focusField = (field: ContactField) => {
    formRef.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
  };

  // A refused submit with two or more problems: the summary takes focus once it is drawn.
  useEffect(() => {
    if (summaryTurn > 0) summaryRef.current?.focus();
  }, [summaryTurn]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isRateLimited) {
      setErrorMessage(limitMessage());
      setStatus("error");
      return;
    }

    // The live checks are a convenience; this is the form's own gate (and the API is the real one).
    const current = readForm();
    setValues(current);
    const problems = contactProblems(current);
    const failing = CONTACT_FIELDS.filter((f) => problems[f]);
    setSubmitted(true);
    if (failing.length > 0) {
      setStatus("idle");
      setErrorMessage("");
      if (failing.length > 1) setSummaryTurn((n) => n + 1);
      else {
        setSummaryTurn(0);
        focusField(failing[0]);
      }
      return;
    }
    setSummaryTurn(0);

    setStatus("sending");
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      ...Object.fromEntries(formData.entries()),
      renderedAt: renderedAt.current,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        // 429 carries its own retry guidance; 422 names each field to fix.
        setServerFields(data.fields ?? {});
        setErrorMessage(data.error ?? NOT_SENT);
        setStatus("error");
        return;
      }

      // Only count sends that actually succeeded.
      const next = withThisSubmission();
      recordSubmission(next);
      setSubmissions(next);
      setStatus("sent");
    } catch {
      setErrorMessage("We couldn't reach Daily Minty. Check your connection and send it again.");
      setStatus("error");
    }
  }

  const summaryItems =
    summaryTurn > 0
      ? CONTACT_FIELDS.flatMap((f) => {
          const problem = problemOf(f);
          return problem ? [{ field: f, problem }] : [];
        })
      : [];

  /** One field's control wiring: id/name, limits, ARIA, the left-field hook and its look. */
  const controlProps = (field: ContactField) => {
    const problem = problemOf(field);
    return {
      id: field,
      name: field,
      maxLength: MAX_LENGTHS[field],
      "aria-required": REQUIRED.has(field) || undefined,
      "aria-invalid": problem ? true : undefined,
      "aria-describedby": problem ? `${field}-problem` : undefined,
      onBlur: () => setLeft((l) => ({ ...l, [field]: true })),
      className: cn(
        "w-full min-h-11 bg-[#fbf8f2] px-3 py-2.5 md:p-3 rounded-xl border text-sm transition-colors",
        "outline-hidden focus-visible:border-cta focus-visible:ring-2 focus-visible:ring-cta/40",
        problem ? "border-red-500" : "border-line",
      ),
    };
  };

  return (
    <AnimatedContent
      distance={100}
      direction="vertical"
      reverse={false}
      duration={0.8}
      ease="power3.out"
      initialOpacity={0}
      animateOpacity
      scale={1}
      threshold={0.1}
      delay={0}
    >
      <section className="max-w-[1000px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 pb-12 md:pb-20 mt-12 md:mt-20">
        {/* Left: Contact Form Card with Subtle Shadow */}
        <div className="min-w-0 lg:col-span-7 bg-white p-6 md:p-10 rounded-[20px] md:rounded-[32px] shadow-[0_4px_32px_rgba(0,0,0,0.03)] border border-gray-100">
          <h2 className="text-[20px] md:text-2xl font-extrabold text-ink-deep mb-2">
            Send us a message
          </h2>
          <p className="text-[13px] md:text-sm text-[#4A7280] mb-6 md:mb-8">
            {siteConfig.replyPromise}
          </p>

          {status === "sent" ? (
            <div className="flex flex-col items-start gap-3 py-8">
              <div className="w-12 h-12 rounded-full bg-[#D4EFE9] flex items-center justify-center">
                <Icon name="check_circle" className="w-6 h-6 text-teal-deep" />
              </div>
              <h3 className="text-lg font-extrabold text-ink-deep">Message sent!</h3>
              <p className="text-sm text-[#4A7280]">
                Thanks for reaching out — we&apos;ve got your message and will reply to your inbox.
              </p>
              {isRateLimited ? (
                <p className="text-[13px] text-[#4A7280]">
                  {hitLimit ? limitMessage() : `You can send another message in ${secondsLeft}s.`}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    setSubmitted(false);
                    setLeft({});
                    setValues(EMPTY_VALUES);
                  }}
                  className="inline-flex min-h-11 items-center text-sm font-bold text-teal-deep hover:underline"
                >
                  Send another message →
                </button>
              )}
            </div>
          ) : (
            <form
              ref={formRef}
              className="space-y-4 md:space-y-5"
              onSubmit={handleSubmit}
              noValidate
            >
              {summaryItems.length > 1 && (
                <div
                  ref={summaryRef}
                  tabIndex={-1}
                  role="alert"
                  aria-labelledby="contact-summary-title"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 outline-hidden focus-visible:ring-2 focus-visible:ring-red-300"
                >
                  <p id="contact-summary-title" className="text-sm font-bold text-red-700">
                    {SUMMARY_LEAD}
                  </p>
                  <ul className="mt-1">
                    {summaryItems.map(({ field, problem }) => (
                      <li key={field}>
                        <a
                          href={`#${field}`}
                          onClick={(e) => {
                            e.preventDefault();
                            focusField(field);
                          }}
                          className="inline-flex min-h-11 items-center text-sm text-red-700 underline"
                        >
                          {problem}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="min-w-0">
                  <FieldLabel field="name" />
                  <input
                    {...controlProps("name")}
                    required
                    autoComplete="name"
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="minty"
                  />
                  <FieldProblem field="name" text={problemOf("name")} />
                </div>
                <div className="min-w-0">
                  <FieldLabel field="email" />
                  <input
                    {...controlProps("email")}
                    {...emailInput.props}
                    required
                    placeholder="you@business.com"
                  />
                  <FieldProblem field="email" text={problemOf("email")} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="min-w-0">
                  <FieldLabel field="businessName" />
                  <input
                    {...controlProps("businessName")}
                    autoComplete="organization"
                    onChange={(e) => setField("businessName", e.target.value)}
                    placeholder="Optional"
                  />
                  <FieldProblem field="businessName" text={problemOf("businessName")} />
                </div>

                <div className="min-w-0">
                  <FieldLabel field="topic" />
                  <select
                    {...controlProps("topic")}
                    required
                    defaultValue=""
                    onChange={(e) => setField("topic", e.target.value)}
                    className={cn(
                      controlProps("topic").className,
                      "appearance-none text-[#4A7280]",
                    )}
                  >
                    <option value="" disabled>
                      Pick one...
                    </option>
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <FieldProblem field="topic" text={problemOf("topic")} />
                </div>
              </div>

              <div>
                <FieldLabel field="message" />
                <textarea
                  {...controlProps("message")}
                  required
                  onChange={(e) => setField("message", e.target.value)}
                  className={cn(controlProps("message").className, "resize-none md:p-4")}
                  rows={4}
                  placeholder="Tell us a bit about..."
                />
                <FieldProblem field="message" text={problemOf("message")} />
              </div>

              {/* Honeypot — hidden from users, catches bots that fill every field */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] w-px h-px opacity-0"
              />

              {status === "error" && (
                <p
                  role="alert"
                  className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
                >
                  {errorMessage}
                </p>
              )}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 pt-2">
                <p className="text-[13px] text-[#4A7280]">
                  By submitting, you agree to our{" "}
                  <a
                    href={siteConfig.privacyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-deep underline"
                  >
                    privacy policy
                  </a>
                  . We&apos;ll only use your details to reply to you.
                </p>
                <div className="flex flex-col items-stretch md:items-end gap-1.5">
                  <button
                    type="submit"
                    // Keep focus in the field on mouse-down: leaving it would show that field's
                    // message, push this button down, and the mouse-up would miss it - a lost click.
                    // The submit then shows every message anyway. Keyboard use is unaffected.
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={status === "sending" || isRateLimited}
                    aria-describedby={isRateLimited ? "send-wait" : undefined}
                    className="min-h-11 bg-cta text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold text-sm hover:bg-cta-hover active:bg-cta-pressed transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === "sending" ? "Sending…" : "Send message →"}
                  </button>
                  {/* A gated button says why, beside it - not only in a tooltip. */}
                  {isRateLimited && (
                    <p id="send-wait" className="text-xs text-[#4A7280] md:text-right">
                      {limitMessage()}
                    </p>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="min-w-0 lg:col-span-5 space-y-3 md:space-y-4">
          <ContactCard
            icon={<Icon name="mail" className="w-4 md:w-5 h-4 md:h-5 text-teal-deep" />}
            title="Email us directly"
            text={`Best for detailed questions. ${siteConfig.replyPromise}`}
            href={`mailto:${siteConfig.contactEmail}`}
            linkText={`${siteConfig.contactEmail} →`}
          />
          <ContactCard
            icon={<Icon name="chat" className="w-4 md:w-5 h-4 md:h-5 text-teal-deep" />}
            title="WhatsApp us"
            text="Chat directly with our team on WhatsApp during business hours."
            href="https://wa.me/85260423884"
            external
            linkText="Start chat →"
          />
          <ContactCard
            icon={<Icon name="help" className="w-4 md:w-5 h-4 md:h-5 text-teal-deep" />}
            title="Help centre"
            text="Step-by-step guides, video walkthroughs, and answers to the most common questions."
            href="/resources/learning"
            linkText="Browse articles →"
          />
        </div>
      </section>
    </AnimatedContent>
  );
}

const EMPTY_VALUES: ContactValues = {
  name: "",
  email: "",
  businessName: "",
  topic: "",
  message: "",
};

const NOT_SENT = `Your message didn't send. Try again, or email us at ${siteConfig.contactEmail}.`;

/** A field's label: a red * for a required one, plus "(required)" for screen readers. */
function FieldLabel({ field }: { field: ContactField }) {
  return (
    <label htmlFor={field} className="block text-xs font-bold text-ink-deep mb-1.5">
      {FIELD_LABELS[field]}
      {REQUIRED.has(field) && (
        <>
          <span className="text-red-500" aria-hidden>
            {" "}
            *
          </span>
          <span className="sr-only"> (required)</span>
        </>
      )}
    </label>
  );
}

function FieldProblem({ field, text }: { field: ContactField; text: string | null }) {
  return text ? (
    <p id={`${field}-problem`} className="mt-1.5 text-xs text-red-600">
      {text}
    </p>
  ) : null;
}

function ContactCard({
  icon,
  title,
  text,
  href,
  external,
  linkText,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href: string;
  external?: boolean;
  linkText: string;
}) {
  return (
    <div className="bg-[#FAF6F0] p-4 md:p-6 rounded-[16px] md:rounded-[24px] border border-[#F2EFE8] hover:border-[#E8E1D5] transition-colors">
      <div className="flex items-start gap-3 md:gap-4">
        <div className="w-9 md:w-10 h-9 md:h-10 rounded-full bg-[#D4EFE9] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-ink-deep mb-1 text-[13px] md:text-sm">{title}</h3>
          <p className="text-xs text-[#4A7280] leading-relaxed md:leading-4 mb-1">{text}</p>
          <a
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="inline-flex min-h-11 items-center text-xs font-bold text-teal-deep hover:underline break-all"
          >
            {linkText}
          </a>
        </div>
      </div>
    </div>
  );
}
