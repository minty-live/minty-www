import Container from '@/components/ui/Container';
import { landingContent } from '@/config/landing';
import Icon from '@/components/ui/Icon';
import FadeContent from '@/animations/landing/fadeanim';

export default function HelpsYouSection() {
  const { helpsYou } = landingContent;
  return (
    <FadeContent blur={true} duration={1000} ease="ease-out" initialOpacity={0}>
    <section className="bg-mint-soft py-12 md:py-20" aria-labelledby="helps-title">
      <Container>
        {/* Title with leaf icon */}
        <div className="text-center mb-20 flex flex-col items-center justify-center">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="eco" className="w-8 h-8 text-teal-deep" />
            <h2 id="helps-title" className="text-[42px] md:text-[48px] font-extrabold text-ink tracking-tight">
              {helpsYou.title}
            </h2>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {helpsYou.cards.map((card, index) => {

            return (
              <article
                key={index}
                className="bg-white rounded-3xl p-10 text-center flex flex-col items-center justify-start shadow-minty-sm hover:shadow-minty-md active:shadow-minty-md focus-within:shadow-minty-md transition-shadow duration-200 cursor-pointer"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-mint rounded-full text-teal-deep mb-5">
                  <Icon name={card.icon} className="w-8 h-8" />
                </div>

                <p className="text-[16px] text-ink-soft leading-relaxed font-medium">
                  {card.body.includes('Xero') ? (
                    <>
                      Trust your daily numbers and sync them directly to{' '}
                      <span className="text-[#2baae0] font-bold">Xero.</span>
                    </>
                  ) : (
                    card.body
                  )}
                </p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
    </FadeContent>
  );
}