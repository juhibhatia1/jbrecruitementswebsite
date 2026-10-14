"use client";

import React, { useState } from "react";
import BrandingHero from "../components/personal-branding/branding-hero";
import FounderNote from "../components/personal-branding/founder-note";
import WhoIsThisFor from "../components/personal-branding/who-is-this-for";
import BrandingPillars from "../components/personal-branding/branding-pillars";
import OutcomesSection from "../components/personal-branding/outcomes-section";
import PricingPackages from "../components/personal-branding/pricing-packages";
import NotForSection from "../components/personal-branding/not-for-section";
import ReadyCtaSection from "../components/personal-branding/ready-cta-section";
import BrandingFaq from "../components/personal-branding/branding-faq";
import InquiryModal from "../components/personal-branding/inquiry-modal";

export default function PersonalBrandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<"3-month" | "6-month" | "general">("general");

  const handleOpenInquiry = (pkg?: "3-month" | "6-month" | "general") => {
    setSelectedPackage(pkg || "general");
    setIsModalOpen(true);
  };

  const handleCloseInquiry = () => {
    setIsModalOpen(false);
  };

  return (
    <div
      className="min-h-screen bg-white text-[#252E3D]"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <main className="flex-grow">
        {/* 1. Hero Section */}
        <BrandingHero onOpenInquiry={handleOpenInquiry} />

        {/* 2. A Note from Juhi Bhatia */}
        <FounderNote />

        {/* 3. Who Is This Service For? */}
        <WhoIsThisFor />

        {/* 4. What's Included in Our LinkedIn Personal Branding Service? */}
        <BrandingPillars />

        {/* 5. What Can You Expect From This Service? */}
        <OutcomesSection />

        {/* 6. Choose Your Personal Branding Package */}
        <PricingPackages onOpenInquiry={handleOpenInquiry} />

        {/* 7. Who This Service Is NOT For */}
        <NotForSection />

        {/* 8. Ready to Build Your Personal Brand? */}
        <ReadyCtaSection onOpenInquiry={handleOpenInquiry} />

        {/* 9. Frequently Asked Questions */}
        <BrandingFaq onOpenInquiry={handleOpenInquiry} />
      </main>

      {/* 10. Inquiry & Consultation Modal */}
      <InquiryModal
        isOpen={isModalOpen}
        onClose={handleCloseInquiry}
        selectedPackage={selectedPackage}
      />
    </div>
  );
}
