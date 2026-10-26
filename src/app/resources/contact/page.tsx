import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactHero from "@/components/contact/ContactHero";
import ContactFormSection from "@/components/contact/ContactFormSection";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Talk to the Daily Minty team: send us a message, email us or chat on WhatsApp. Real people, during business hours.",
  path: "/resources/contact",
});

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F9FBFC]">
      <Navbar />
      <main>
        <ContactHero />
        <ContactFormSection />
      </main>
      <Footer />
    </div>
  );
}
