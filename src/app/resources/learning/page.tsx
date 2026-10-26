import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GetStartedHeroSection from "@/components/get-started/Hero-Section";
import GuidesSection from "@/components/get-started/Guide-Section";
import SupportCardsSection from "@/components/get-started/SupportCardsSection";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Learning",
  description:
    "Short video guides to Daily Minty: setting up your store, connecting Xero, the daily closing, publishing it, and payment requests.",
  path: "/resources/learning",
});

export default function GetStartedPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <GetStartedHeroSection />
        <GuidesSection />
        <SupportCardsSection />
      </main>
      <Footer />
    </>
  );
}
