// The subscription catalogue as this site shows it. Mirrors Minty/docs/schema/seed_catalogue.sql
// (billing_plan: PETTY_CASH 28000, BILL "Payment Request" 28000, BILL+PETTY_CASH "Super Minty"
// 40000, all HKD monthly; billing_policy.trial_days 30). A price, name or trial change goes in
// the database, that file AND here.
import { formatPrice } from '@/lib/money';

export const CURRENCY = 'HKD';
export const TRIAL_DAYS = 30;

export const PLANS = {
  pettyCash: { name: 'Petty Cash', monthly: 280 },
  paymentRequest: { name: 'Payment Request', monthly: 280 },
  superMinty: { name: 'Super Minty', monthly: 400 },
} as const;

/** "HKD 280" */
export const price = (amount: number) => formatPrice(amount, CURRENCY);

/** "HKD 280/mo" */
export const perMonth = (amount: number) => `${price(amount)}/mo`;

/** What the second module adds on top of the first: HKD 120. */
export const SECOND_MODULE_EXTRA = PLANS.superMinty.monthly - PLANS.pettyCash.monthly;
