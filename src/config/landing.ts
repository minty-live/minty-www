import { siteConfig } from './site';
import type { IconName } from '@/components/ui/Icon';

export const landingContent = {
  hero: {
    title: 'Daily Minty',
    titleAccent: '',
    lede: 'No more lost receipts, no more missing numbers.',
    primaryCta: {
      label: 'Join Waitlist',
      href: siteConfig.waitlistUrl,
      external: true,
    },
    secondaryCta: {
      label: 'See how it works',
      href: '#solution',
    },
    trustText: {before: 'Sync directly with',highlighted: 'Xero'},
    imageAlt: 'Daily Minty hero image showing a cat with a laptop and phone',
    image: '/landing/hero-cat-laptop-phone.webp',
  },
  how: {
    title: 'Minty helps you close the day,',
    titleAccent: 'everyday.',
    subtitle: 'Four methods. One go-to dashboard. Zero spreadsheet trauma.',
    steps: [
      {
        num: 1,
        image: '/landing/step1-cat-coins.webp',
        alt: 'Enter today\'s numbers',
        title: 'Enter today\'s numbers',
        body: 'You\'ll be making and entering quickly in a clean, guided interface.',
      },
      {
        num: 2,
        image: '/shared/cash.webp',
        alt: 'Check the cash',
        title: 'Check the cash',
        body: 'Count your drawer + Minty does the math alongside you.',
      },
      {
        num: 3,
        image: '/landing/box-minty.webp',
        alt: 'Request payments',
        title: 'Request payments',
        body: 'Create, pay, and track payment requests + Minty keeps everyone aligned on what is owed.',
      },
      {
        num: 4,
        image: '/landing/step3-cat-phone.webp',
        alt: 'Get a clean daily report',
        title: 'Get a clean daily report',
        body: 'A clean, accurate summary that\'s ready to review, share or export.',
      },
    ],
  },
  problem: {
    tag: 'The Problem',
    headline: 'Stuck in a messy and\ntiring routine.',
    highlights: ['messy', 'tiring'],
    items: [
      'Rushed entries at closing',
      "Numbers don't match",
      'Extra time fixing mistakes',
      'Stress follows you home',
    ],
    imageAlt: 'A sad black cat sitting in a cardboard box surrounded by receipts representing feeling overwhelmed with business closing tasks',
    image: '/landing/problem-cat-box.webp'
  },
  outcome: {
  title: 'Daily closing feels',
  titleAccent: 'clear again.',
  cards: [
    {
      key: 'petty-cash',
      title: 'Petty Cash',
      // (The file names are swapped: landing-payment.webp is the till scene, landing-petty.webp
      // the payments line. Each card shows the right picture.)
      image: '/landing/landing-payment.webp',
      alt: 'Two Minty cats at a cash register, counting the till with a phone and the day’s receipt',
      // Added design tokens for the first card
      icon: 'account_balance_wallet' as IconName,
      bgColor: 'bg-[#00cbb2]',
      iconTextColor: 'text-[#00cbb2]',
      href: 'https://www.youtube.com/watch?v=3_TVkcyzEQs'
    },
    {
      key: 'payment-request',
      title: 'Payment Request',
      image: '/landing/landing-petty.webp',
      alt: 'A line of Minty cats carrying boxes of cash past the owner, who checks a wallet, bills and reports',
      // Added design tokens for the second card
      icon: 'receipt_long' as IconName,
      bgColor: 'bg-[#0f2d37]',
      iconTextColor: 'text-[#0f2d37]',
      href: 'https://www.youtube.com/watch?v=fucuzlKQwDU'
    },
  ],
},
helpsYou: {
  title: 'Minty helps you to',
  cards: [
    {
      icon: 'check_circle' as IconName,
      alt: 'Checkmark icon',
      body: 'Account accurately, and less stress around daily figures.',
    },
    {
      icon: 'sync' as IconName,
      alt: 'Sync circle icon',
      body: 'Trust your daily numbers and sync them directly to Xero.',
    },
    {
      icon: 'credit_card' as IconName,
      alt: 'Plan card icon',
      body: 'Plan all your shop in one place.',
    },
  ],
},
demo: {
  badge: 'WATCH HOW IT WORKS',
  title: 'See Minty in action',
  subtitle: '',
  buttonText: 'Join Waitlist',
  videoUrl: 'https://www.youtube.com/embed/LZVNOp6YTzE',
},
keepMeUpdated: {
  eyebrow: 'Interested?',
  title: 'Keep me updated',
  buttonText: 'Join the Waitlist',
  backgroundImage: '/landing/sky.webp',
  mascotImage: '/landing/super.webp',
  mascotAlt: 'Minty mascot superhero with red cape',
}
};
