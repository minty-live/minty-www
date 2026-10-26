'use client';

import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { siteConfig } from '@/config/site';
import { PLANS, SECOND_MODULE_EXTRA, TRIAL_DAYS, perMonth, price } from '@/config/pricing';
import AnimatedContent from '@/animations/landing/heroanim';

const pricingPlans = [
  {
    id: 'petty-cash',
    title: PLANS.pettyCash.name,
    description: 'Track every dollar in and out of the till — receipts, floats, and daily reconciliation.',
    illustrationSrc: '/pricing/sub-petty-cash.webp',
    crossedText: perMonth(PLANS.pettyCash.monthly),
    currentPrice: 'Free',
    subText: 'per shop, billed monthly\nSingle service subscription.',
    trialText: `Free trial for the first ${TRIAL_DAYS} days, then ${perMonth(PLANS.pettyCash.monthly)}.`,
    featuresHeading: 'What you get:',
    features: ['Daily petty cash', 'Cash flow & PDF report', 'Xero sync (cash entries)', 'Team invites & roles'],
    isPopular: false,
  },
  {
    id: 'payment-request',
    title: PLANS.paymentRequest.name,
    description: 'Request supplier payments, log what you paid, and never miss a due date.',
    illustrationSrc: '/pricing/sub-bill-payment.webp',
    crossedText: perMonth(PLANS.paymentRequest.monthly),
    currentPrice: 'Free',
    subText: 'per shop, billed monthly\nSingle service subscription.',
    trialText: `Free trial for the first ${TRIAL_DAYS} days, then ${perMonth(PLANS.paymentRequest.monthly)}.`,
    featuresHeading: 'What you get:',
    features: ['Payment scheduling & reminder', 'Supplier & vendor directory', 'Payment logging & proof upload', 'Payables & PDF reports', 'Xero sync (bills & payments)', 'Team invites & roles'],
    isPopular: false,
  },
  {
    id: 'super-minty',
    title: PLANS.superMinty.name,
    description: `Both services, one bill — add the second for just ${price(SECOND_MODULE_EXTRA)} more.`,
    illustrationSrc: '/pricing/sub-super-minty.webp',
    crossedText: perMonth(PLANS.superMinty.monthly),
    currentPrice: 'Free',
    subText: `${PLANS.pettyCash.name} + ${PLANS.paymentRequest.name}, billed monthly.`,
    trialText: `Free trial for the first ${TRIAL_DAYS} days, then ${perMonth(PLANS.superMinty.monthly)}.`,
    featuresHeading: 'Everything in both services:',
    features: [`Everything from ${PLANS.pettyCash.name}`, `Everything from ${PLANS.paymentRequest.name}`, 'Xero sync (full)', 'Multi-shop management', 'Team invites & roles'],
    isPopular: true,
    badgeText: 'Best Value'
  }
];

export default function PricingGrid() {
  const [selectedPlan, setSelectedPlan] = useState<string>('super-minty');

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
    <section className="max-w-[1400px] mx-auto px-4 mb-16">
      <div className="flex justify-center mb-12">
      <span className="bg-white border border-gray-100 text-ink-deep text-[13px] font-bold px-6 py-2.5 rounded-full shadow-md tracking-wide">
        Subscription Types
      </span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch">
      {pricingPlans.map((plan) => {
        const isSelected = selectedPlan === plan.id;
        const isSuperMintyGreen = isSelected && plan.id === 'super-minty';

        return (
          // Highlighting a card is visual only. A pointer selects it with a click, the keyboard
          // with focus (tabbing to its Join Waitlist link): the card is not a control itself,
          // because it holds one.
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            onFocus={() => setSelectedPlan(plan.id)}
            className={`border rounded-[24px] p-8 flex flex-col justify-between transition-all duration-200 cursor-pointer relative ${
              isSuperMintyGreen
                ? 'bg-[#01d0c1] border-[#01d0c1] shadow-[0_12px_36px_rgba(1,208,193,0.2)] scale-[1.01] text-white'
                : isSelected && (plan.id === 'petty-cash' || plan.id === 'payment-request')
                ? 'bg-white border-gray-300 shadow-md scale-[1.01]'
                : 'bg-[#f4f6fc] border-gray-200/70 shadow-xs hover:border-gray-300'
            }`}
          >
            <div>
              {/* Fixed-ratio frame: the source PNGs have different intrinsic ratios, so the
                  image must fit inside the box rather than set its height — otherwise
                  each card's content starts at a different y. */}
              <div className="relative bg-[#F5F8F9] rounded-2xl w-full aspect-[1.45/1] mb-6 overflow-hidden border border-gray-100/50">
                <Image
                  src={plan.illustrationSrc}
                  alt={plan.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-contain"
                />
              </div>

              
              <div className="flex gap-2 items-center mb-3">
                <h2 className={`text-2xl font-extrabold ${isSuperMintyGreen ? 'text-white' : 'text-ink-deep'}`}>{plan.title}</h2>
                {plan.badgeText && <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${isSuperMintyGreen ? 'bg-white/20 text-white' : 'bg-[#E5ECF0] text-[#4A7280]'}`}>{plan.badgeText}</span>}
              </div>

              <p className={`text-xs leading-relaxed mb-8 min-h-[39px] ${isSuperMintyGreen ? 'text-white/80' : 'text-gray-600'}`}>{plan.description}</p>

              <div className="flex items-center gap-3 mb-1.5">
                <span className={`font-bold text-2xl relative ${isSuperMintyGreen ? 'text-white/70' : 'text-gray-500'}`}>
                  <span className="sr-only">Usually </span>
                  {plan.crossedText}
                  <span className="absolute left-0 top-1/2 w-full h-[2.5px] bg-[#FF5E5E] -translate-y-1/2 rounded-sm" />
                </span>
                <span className={isSuperMintyGreen ? 'text-white font-extrabold text-3xl' : 'text-teal-deep font-extrabold text-3xl'}>
                  <span className="sr-only">, now </span>
                  {plan.currentPrice}
                </span>
              </div>

              <p className={`text-xs leading-[1.6] whitespace-pre-line mb-3 min-h-[38px] ${isSuperMintyGreen ? 'text-white/80' : 'text-gray-600'}`}>{plan.subText}</p>
              
      
              <p className={`text-xs font-medium p-3 rounded-xl mb-6 ${isSuperMintyGreen ? 'bg-white/15 text-white' : 'text-ink-deep bg-[#F5F8F9]'}`}>{plan.trialText}</p>

              <Button
                href={siteConfig.waitlistUrl}
                external
                className={`w-full py-3 font-semibold text-sm mb-8 ${isSelected ? 'bg-ink-deep text-white hover:bg-[#1A4B5D]' : 'bg-[#ECF2F5] text-ink-deep hover:bg-[#E1EAEB]'}`}
              >
                Join Waitlist
              </Button>

              <div className={`border-t pt-6 ${isSuperMintyGreen ? 'border-white/20' : 'border-gray-100'}`}>
                <p className={`text-xs font-bold mb-3 ${isSuperMintyGreen ? 'text-white' : 'text-ink-deep'}`}>
                  {plan.featuresHeading}
                </p>
                <ul className={`flex flex-col gap-3.5`}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} className={`flex items-start gap-1.5 text-xs ${isSuperMintyGreen ? 'text-white' : 'text-gray-600'}`}>
                    <span className={isSuperMintyGreen ? 'text-white font-bold' : 'text-black font-bold'}>✓</span>
                    {feature.includes('Xero') ? (
                      <>
                        {feature.substring(0, feature.indexOf('Xero')).trim()}
                        {' '}
                        {/* The blue washes out on the teal Super Minty card, so it
                            falls back to black there. */}
                        <span className={`font-bold ${isSuperMintyGreen ? 'text-black' : 'text-[#2baae0]'}`}>Xero</span>
                        {feature.substring(feature.indexOf('Xero') + 4).trimStart()}
                      </>
                    ) : (
                      feature
                    )}
                  </li>
                ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>

      <p className="text-center text-gray-600 text-xs max-w-[800px] mx-auto mb-16 leading-normal mt-8">
        *Prices in HKD, billed monthly per shop. Subscribe to one service for {perMonth(PLANS.pettyCash.monthly)}, or add the second for just {price(SECOND_MODULE_EXTRA)} more — the {PLANS.superMinty.name} bundle at {perMonth(PLANS.superMinty.monthly)}.
      </p>
    </section>
    </AnimatedContent>
  );
}