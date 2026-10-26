// The contact form's rules, shared by the form (src/components/contact/ContactFormSection.tsx,
// which checks as you type) and the API (src/app/api/contact/route.ts, which is the gate). No
// React here: the route imports it.
//
// Messages follow Part 11: say what is wrong, then what to do, never "Invalid" or "required".

import { EMAIL_ASCII_HINT, hasNonAsciiEmailChar, isEmail } from "./email";

export type ContactField = "name" | "email" | "businessName" | "topic" | "message";

export type ContactValues = Record<ContactField, string>;

/** The order the form shows its fields in (and the error summary lists them). */
export const CONTACT_FIELDS: ContactField[] = ["name", "email", "businessName", "topic", "message"];

export const REQUIRED: ReadonlySet<ContactField> = new Set(["name", "email", "topic", "message"]);

export const MAX_LENGTHS: Record<ContactField, number> = {
  name: 100,
  email: 200,
  businessName: 150,
  topic: 100,
  message: 5000,
};

export const TOPICS = [
  "Getting started",
  "Billing & pricing",
  "Technical issue",
  "Xero / integrations",
  "Something else",
];

const EMPTY: Record<ContactField, string> = {
  name: "Your name is still empty. Add your name to continue.",
  email: "The email is still empty. Add your email so we can reply.",
  businessName: "",
  topic: "No topic is picked yet. Pick the one closest to your question.",
  message: "The message is still empty. Tell us how we can help.",
};

const SUBJECT: Record<ContactField, string> = {
  name: "Your name",
  email: "The email",
  businessName: "The business name",
  topic: "The topic",
  message: "The message",
};

/** Shown in the summary's links: "Your name", "Email" ... */
export const FIELD_LABELS: Record<ContactField, string> = {
  name: "Your name",
  email: "Email",
  businessName: "Business name",
  topic: "Topic",
  message: "How can we help?",
};

export const EMAIL_INCOMPLETE =
  "This email looks unfinished. Check it reads like name@business.com.";

/**
 * The one problem with a field's value, or null. `stage`:
 * - 'typing'    - only what is wrong the moment it is typed (a non-English character, too long);
 *                 never "empty" and never "unfinished", which typing has not finished yet;
 * - 'left'      - the field was left: an unfinished email now counts too;
 * - 'submitted' - everything, empty required fields included.
 */
export function fieldProblem(
  field: ContactField,
  rawValue: string,
  stage: "typing" | "left" | "submitted",
): string | null {
  const value = rawValue.trim();
  if (!value) {
    return stage === "submitted" && REQUIRED.has(field) ? EMPTY[field] : null;
  }
  if (field === "email" && hasNonAsciiEmailChar(value)) return EMAIL_ASCII_HINT;
  const max = MAX_LENGTHS[field];
  if (value.length > max) {
    return `${SUBJECT[field]} is over ${max.toLocaleString("en-US")} characters. Shorten it to ${max.toLocaleString("en-US")} or fewer.`;
  }
  if (field === "topic" && !TOPICS.includes(value)) {
    return "That topic is not one of ours. Pick one from the list.";
  }
  if (field === "email" && stage !== "typing" && !isEmail(value)) return EMAIL_INCOMPLETE;
  return null;
}

/** Every field's problem at submit time; empty when the message can be sent. */
export function contactProblems(values: ContactValues): Partial<Record<ContactField, string>> {
  const out: Partial<Record<ContactField, string>> = {};
  for (const field of CONTACT_FIELDS) {
    const problem = fieldProblem(field, values[field] ?? "", "submitted");
    if (problem) out[field] = problem;
  }
  return out;
}

/** The sentence a refused submit leads with when more than one field needs attention. */
export const SUMMARY_LEAD = "A few details need another look before this can send.";
