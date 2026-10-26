import type { Metadata } from 'next';
import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FAQHero from '@/components/support/FaqHero';
import FAQCategories from '@/components/support/FaqCategories';
import FAQSupportSection from '@/components/support/FaqSupportSection';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'FAQ',
  description:
    'Answers to common Daily Minty questions, from your first daily closing to running several shops and working with your accountant.',
  path: '/resources/faq',
});

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#F9FBFC]">
      <Navbar />
      <main>
        <FAQHero />
        {/* FAQCategories reads ?faqId= (useSearchParams), which needs a Suspense boundary to let
            the rest of the page render statically. */}
        <Suspense fallback={<div className="min-h-screen" />}>
          <FAQCategories />
        </Suspense>
        <FAQSupportSection />
      </main>
      <Footer />
    </div>
  );
}
