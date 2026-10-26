// The FAQ on /resources/faq. Every answer describes what Minty actually does today - checked
// against minty-petty-cash-api, minty-petty-cash-web and Minty's docs on 2026-10-26. Change an
// answer when the product changes, not before: a promise here is a promise to a customer.
import { siteConfig } from "./site";

export type ListItem = string | { strong: string; text: string };

// One row of the roles table, in the FaqAccordion's column order.
export type PermissionRow = {
  name: string;
  roles: { CASHIER: boolean; "SHOP MANAGER": boolean; ACCOUNTANT: boolean; ADMIN: boolean };
};

// The block types FaqAccordion renders.
export type FaqBlock =
  | { type: "p"; text: string }
  | { type: "p-strong"; text: string }
  | { type: "ul"; items: ListItem[] }
  | { type: "ol"; items: string[] }
  | { type: "permissions-table"; permissions: PermissionRow[] };

export interface FaqItem {
  id: string;
  category: "beginner" | "intermediate" | "accountant";
  question: string;
  wide?: boolean;
  body: FaqBlock[];
}

const everyone = { CASHIER: true, "SHOP MANAGER": true, ACCOUNTANT: true, ADMIN: true };
const managersUp = { CASHIER: false, "SHOP MANAGER": true, ACCOUNTANT: true, ADMIN: true };
const accountantsUp = { CASHIER: false, "SHOP MANAGER": false, ACCOUNTANT: true, ADMIN: true };

export const landingFaq: FaqItem[] = [
  {
    id: "not-finished",
    category: "beginner",
    question: "I didn't finish today's closing. Is that okay?",
    body: [
      {
        type: "p",
        text: "Yes. Save & Exit keeps the day as a draft, and Continue Daily Closing opens it at the step you left. Each step is saved when you press Save & Next or Save & Exit, so save before you close the page. Finish that day before you start the next one.",
      },
    ],
  },
  {
    id: "closing-time",
    category: "beginner",
    question: "Do I have to close at the same time every day?",
    body: [
      {
        type: "p",
        text: "No. Close whenever your day ends. Minty picks the date for you: each closing is for the day after your last submitted one.",
      },
    ],
  },
  {
    id: "skip-day",
    category: "beginner",
    question: "What happens if I skip a day?",
    body: [
      {
        type: "p",
        text: "Minty keeps your days in order, so a missed day waits for you. The next closing you start is for that day, with its opening cash carried over from the day before. Catch up one day at a time and you're back on track.",
      },
    ],
  },
  {
    id: "exact-numbers",
    category: "beginner",
    question: "Do the numbers need to be exact?",
    body: [
      {
        type: "p",
        text: "Every cent counts, but small differences happen. If your count doesn't match what Minty expects, add a short reason and carry on. The difference is kept with the day, and it goes to Xero as its own entry.",
      },
    ],
  },
  {
    id: "dont-match",
    category: "beginner",
    question: "What if the numbers don't match?",
    body: [
      {
        type: "p",
        text: "Minty shows the cash it expects next to the cash you counted. Check the cash sales, the expenses and the deposit you entered. If it still doesn't match, add the reason and submit. You can reopen your latest closing later with Edit report.",
      },
    ],
  },
  {
    id: "change-numbers",
    category: "beginner",
    question: "Can Minty change my numbers without me knowing?",
    body: [
      {
        type: "p",
        text: "No. Minty only adds up what you enter: it carries yesterday's closing cash forward as today's opening balance and works out the totals. It never changes a figure you typed, and every change to a closing is recorded with who made it.",
      },
    ],
  },
  {
    id: "no-receipt",
    category: "beginner",
    question: "What if I don't have a receipt?",
    body: [
      {
        type: "p",
        text: "Every expense needs one: a photo or a PDF (JPEG, PNG or PDF, up to 10 MB). If the paper receipt is lost, attach whatever shows the spend, such as the supplier's invoice or a signed note of what was bought, for how much and when.",
      },
    ],
  },
  {
    id: "same-day-upload",
    category: "beginner",
    question: "Do receipts have to be uploaded on the same day?",
    body: [
      {
        type: "p",
        text: "Each expense gets its receipt when you add it. If you need to swap one later, even after the day is submitted, open the day's report and use Edit expense.",
      },
    ],
  },
  {
    id: "something-off",
    category: "beginner",
    question: "Will I get in trouble if something is off?",
    body: [
      {
        type: "p",
        text: "No. A difference isn't a mistake, it's a record. Minty asks for the reason so you and your accountant can see what happened.",
      },
    ],
  },
  {
    id: "monitoring-shop",
    category: "beginner",
    question: "Is Minty monitoring or controlling my shop?",
    body: [
      {
        type: "p",
        text: "No. Minty doesn't connect to your till, card terminal or bank. It only holds what your team enters in the daily closing, and only the people you invite to your company can see it.",
      },
    ],
  },
  {
    id: "customer-support",
    category: "beginner",
    question: "When should I contact support?",
    body: [
      {
        type: "p",
        text: `Whenever the numbers don't add up, a screen doesn't do what you expect, or you're not sure how to set something up. Email ${siteConfig.contactEmail} or use the contact page. ${siteConfig.replyPromise}`,
      },
    ],
  },

  {
    id: "one-closing-a-day",
    category: "intermediate",
    question: "Can I do more than one closing a day?",
    body: [
      {
        type: "p",
        text: "No. One closing covers a shop's whole day. If several people handle the drawer, they all work on that day's closing: anyone on the team can continue the draft.",
      },
    ],
  },
  {
    id: "fix-a-day",
    category: "intermediate",
    question: "I made a mistake in a closing. Can I fix it?",
    body: [
      { type: "p", text: "Yes." },
      {
        type: "ul",
        items: [
          {
            strong: "Your latest closing",
            text: "can be reopened with Edit report, changed and submitted again.",
          },
          {
            strong: "Any submitted day",
            text: "can still have its details corrected: the reason for a difference, where added cash came from, and an expense's supplier, account, description or receipt.",
          },
        ],
      },
    ],
  },
  {
    id: "share-with-accountant",
    category: "intermediate",
    question: "Can I show a closing to someone outside Minty?",
    body: [
      {
        type: "p",
        text: "Yes. Share a day's report as a read-only link that needs no sign-in. It works for 30 days, and sharing the same day again renews it.",
      },
    ],
  },

  {
    id: "export-ledger",
    category: "accountant",
    question: "Can I export to Xero or another accounting system?",
    wide: true,
    body: [
      { type: "p-strong", text: "Minty publishes each submitted day straight to Xero:" },
      {
        type: "ul",
        items: [
          "the cash added to the drawer;",
          "the cash sales;",
          "every expense, with its receipt attached;",
          "the deposit;",
          "any difference in the count.",
        ],
      },
      {
        type: "p",
        text: "For anything else, download a CSV of your submitted days (up to a year at a time) with the date, account code, amount, description and reference. There is no QuickBooks connection.",
      },
    ],
  },
  {
    id: "edit-published",
    category: "accountant",
    question: "What if I change a day that's already in Xero?",
    wide: true,
    body: [
      {
        type: "p",
        text: "Reopen it with Edit report, make the change, then submit and publish it again; until then it shows as Submitted. Publishing again can add new entries in Xero, so check there and void the old ones. Minty's publish screen tells you when.",
      },
    ],
  },
  {
    id: "user-permissions",
    category: "accountant",
    question: "Why do different users see different things in Minty?",
    wide: true,
    body: [
      {
        type: "p",
        text: "Minty gives each person a role, so each sees and does only what their job needs.",
      },
      {
        // Matches minty-petty-cash-api/core/policy.py (2026-10-26).
        type: "permissions-table",
        permissions: [
          { name: "Prepare and submit a daily closing", roles: everyone },
          { name: "See every daily closing in the shop", roles: everyone },
          { name: "Edit or delete a closing you saved", roles: everyone },
          { name: "Delete anyone's closing", roles: managersUp },
          { name: "Sales method and expense code settings", roles: accountantsUp },
          { name: "Publish to Xero", roles: accountantsUp },
          { name: "Connect and disconnect Xero", roles: accountantsUp },
        ],
      },
    ],
  },
];
