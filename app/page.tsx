import dynamic from "next/dynamic";
import HeroSection from "./components/home/hero";
import HowWeHelpSection from "./components/home/how-we-help";

const HiringJourney = dynamic(() => import("./components/home/hiring-journey"));
const WhyJBSection = dynamic(() => import("./components/home/why-jb-section"));
const Testimonials = dynamic(() => import("./components/home/testimonials"));
const AdvisorTrustSection = dynamic(
  () => import("./components/home/advisor-trust-section"),
);
const FAQsSection = dynamic(() => import("./components/home/faq-section"));
const FAQSchema = dynamic(() => import("./components/home/faq-schema"));
const TestimonialSchema = dynamic(() => import("./components/home/testimonial-schema"));

export default function Home() {
  return (
    <div className="relative w-full overflow-x-hidden">
      <HeroSection />
      <HowWeHelpSection />
      <HiringJourney />
      <WhyJBSection />
      <Testimonials />
      <AdvisorTrustSection />
      <FAQsSection />
      <FAQSchema />
      <TestimonialSchema />
    </div>
  );
}
