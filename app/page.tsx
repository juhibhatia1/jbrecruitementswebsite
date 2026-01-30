import HeroSection from "./components/home/hero";
import HowWeHelpSection from "./components/home/how-we-help";
import WhyJBSection from "./components/home/why-jb-section";
import HiringJourney from "./components/home/hiring-journey";
import Testimonials from "./components/home/testimonials";
import AdvisorTrustSection from "./components/home/advisor-trust-section";
import FAQsSection from "./components/home/faq-section";

export default function Home() {
  return (
    <div>
      <HeroSection />
      {/* Content wrapper that scrolls over the fixed hero */}
      <div className="relative z-10 bg-white">
        <HowWeHelpSection />
        <HiringJourney />
        <WhyJBSection />
        <Testimonials />
        <AdvisorTrustSection />
        <FAQsSection />
      </div>
    </div>
  );
}
