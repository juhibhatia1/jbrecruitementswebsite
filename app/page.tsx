import Image from "next/image";
import HeroSection from "./components/hero";
import HowWeHelpSection from "./components/how-we-help";
import WhyJBSection from "./components/why-jb-section";
import HiringJourney from "./components/hiring-journey";
import Testimonials from "./components/testimonials";
import AdvisorTrustSection from "./components/advisor-trust-section";
import FAQsSection from "./components/faq-section";
import Footer from "./components/footer";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <HowWeHelpSection />
      <WhyJBSection />
      <HiringJourney />
      <Testimonials />
      <AdvisorTrustSection />
      <FAQsSection />
      <Footer />
    </div>
  );
}
