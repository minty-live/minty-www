import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PricingHero from "@/components/pricing/PricingHero";
import PricingGrid from "@/components/pricing/PricingGrid";
import PricingFAQSupport from "@/components/pricing/PricingFaq";
import { pageMetadata } from "@/lib/metadata";
import { PLANS, TRIAL_DAYS, price } from "@/config/pricing";

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description: `${PLANS.pettyCash.name} or ${PLANS.paymentRequest.name} for ${price(PLANS.pettyCash.monthly)} a month per shop, or both as ${PLANS.superMinty.name} for ${price(PLANS.superMinty.monthly)}. Every plan starts with a ${TRIAL_DAYS}-day free trial.`,
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FBFC]">
      <Navbar />
      <main className="grow pt-6 md:pt-10 pb-0 font-sans">
        <PricingHero />
        <PricingGrid />
        <PricingFAQSupport />
      </main>
      <Footer />
    </div>
  );
}
