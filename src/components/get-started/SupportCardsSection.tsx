import Link from 'next/link';
import Container from '@/components/ui/Container';
import { getStartedContent } from '@/config/get-started';
import FadeContent from '@/animations/landing/fadeanim';

export default function SupportCardsSection() {
  const { faqSection } = getStartedContent;

  return (
    <FadeContent blur={true} duration={1000} ease="ease-out" initialOpacity={0}>
      <section className="bg-[#F4F7F9] py-12 md:py-20 font-sans">
        <Container className="max-w-[950px] px-4 md:px-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {faqSection.supportCards.map((card, idx) => (
              <div
                key={idx}
                // min-h only from md up: on a phone the cards stack, and a 220px
                // floor leaves dead space under the short one.
                className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(17,59,74,0.02)] flex flex-col items-start justify-between md:min-h-[220px]"
              >
                <div>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold mb-5 shadow-2xs ${
                      card.type === 'support' ? 'bg-[#2BBCA6]' : 'bg-[#00CBB0]'
                    }`}
                  >
                    {card.icon}
                  </div>

                  <h3 className="text-ink-deep text-[17px] font-extrabold mb-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 text-[13px] leading-relaxed mb-6">
                    {card.description}
                  </p>
                </div>

                <Link
                  href={card.href}
                  className="text-teal-deep font-bold text-[14px] hover:text-ink-deep inline-flex min-h-11 items-center gap-1 transition-colors group"
                >
                  {card.linkText}
                  <span className="transform transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </FadeContent>
  );
}
