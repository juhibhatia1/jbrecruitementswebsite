import HeroSection from "./components/hero";
import HowWeHelpSection from "./components/how-we-help";
import WhyJBSection from "./components/why-jb-section";
import HiringJourney from "./components/hiring-journey";
import Testimonials from "./components/testimonials";
import AdvisorTrustSection from "./components/advisor-trust-section";
import FAQsSection from "./components/faq-section";
import Footer from "./components/footer";
import FloatingNavbar from "./components/floating-navbar";

export default function Home() {
  return (
    <div>
      <FloatingNavbar />
      <HeroSection />

      {/* Content wrapper that scrolls over the fixed hero */}
      <div className="relative z-10 bg-white">
        <HowWeHelpSection />
        <WhyJBSection />
        <HiringJourney />
        <Testimonials />
        <AdvisorTrustSection />
        <FAQsSection />
        <Footer />
      </div>
    </div>
  );
}
