'use client';

import { useMemo, useState } from 'react';
import { landingFaq } from '@/config/faq';
import FaqAccordion from './FaqAccordion';
import AnimatedContent from '@/animations/landing/heroanim';

const normalize = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // keep only letters, numbers, and spaces
    .replace(/\s+/g, ' ')
    .trim();

/** The FAQ a `?faqId=<question>` deep link names, if any. */
function faqFor(openId?: string | null) {
  if (!openId) return undefined;
  const wanted = normalize(decodeURIComponent(openId));
  return landingFaq.find((item) => normalize(item.question) === wanted);
}

export default function FAQCategories({ openId }: { openId?: string | null }) {
  const [activeTab, setActiveTab] = useState<'beginner' | 'intermediate' | 'accountant'>(
    () => faqFor(openId)?.category ?? 'beginner',
  );
  const [targetId, setTargetId] = useState<string | null>(() => faqFor(openId)?.id ?? null);

  // A new deep link while mounted (client navigation) re-targets during render - React's
  // "adjust state when a prop changes" - rather than in an effect, which renders twice.
  const [seenOpenId, setSeenOpenId] = useState(openId);
  if (openId !== seenOpenId) {
    setSeenOpenId(openId);
    const match = faqFor(openId);
    if (match) {
      setActiveTab(match.category);
      setTargetId(match.id);
    }
  }

  // Memoised: FaqAccordion re-opens its target when this list changes identity, so a fresh array
  // would re-open a closed target whenever this component re-renders for any other reason.
  const filteredFaqs = useMemo(() => landingFaq.filter((item) => item.category === activeTab), [activeTab]);

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
    <section className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* Tab Navigation */}
      <div className="flex flex-col items-center mb-8 md:mb-12">
        <div className="inline-flex bg-[#edf7f5] p-1 md:p-1.5 rounded-full border border-[#d6eae4] shadow-inner flex-wrap justify-center gap-1 md:gap-0">
          {(['beginner', 'intermediate', 'accountant'] as const).map((tab) => {
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setTargetId(null);
                }}
                className={`px-3 md:px-6 py-2 md:py-2.5 rounded-full text-[11px] md:text-sm font-bold transition-all duration-200 flex items-center gap-1 md:gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#00CBB0] text-white shadow-[0_4px_12px_rgba(0,203,176,0.3)]'
                    : 'text-[#1e3a47] hover:bg-white/50'
                }`}
              >
                {tab === 'beginner' && (
                  <span className="text-sm md:text-base" role="img" aria-label="sprout">🌱</span>
                )}
                {tab === 'intermediate' && (
                  <span className="text-sm md:text-base" role="img" aria-label="gear">⚙️</span>
                )}
                {tab === 'accountant' && (
                  <span className="text-sm md:text-base" role="img" aria-label="chart">📊</span>
                )}

                <span>
                  {tab === 'beginner' ? 'Beginner' : tab === 'intermediate' ? 'Intermediate' : 'Accountant'}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-gray-400 text-[12px] md:text-sm mt-3 md:mt-4 text-center">
          {activeTab === 'beginner' && "New to Minty? Start here — the everyday basics of closing your day."}
          {activeTab === 'intermediate' && "Optimize operations — workflows, tracking codes, and team control options."}
          {activeTab === 'accountant' && "Deep dives — bookkeeper workflows, reconciliation tools, and data mapping."}
        </p>
      </div>

      <FaqAccordion items={filteredFaqs} defaultOpenId={targetId} />
    </section>
    </AnimatedContent>
  );
}