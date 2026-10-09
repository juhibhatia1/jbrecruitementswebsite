"use client";

import React, { useState } from "react";
import BrandingHero from "../components/personal-branding/branding-hero";
import PricingPackages from "../components/personal-branding/pricing-packages";
import OutcomesSection from "../components/personal-branding/outcomes-section";
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
        {/* Hero Section */}
        <BrandingHero onOpenInquiry={handleOpenInquiry} />

        {/* Pricing / Packages Section */}
        <PricingPackages onOpenInquiry={handleOpenInquiry} />

        {/* Outcomes & Founder Message */}
        <OutcomesSection onOpenInquiry={handleOpenInquiry} />

        {/* Frequently Asked Questions */}
        <BrandingFaq onOpenInquiry={handleOpenInquiry} />
      </main>

      {/* Inquiry & Consultation Modal */}
      <InquiryModal
        isOpen={isModalOpen}
        onClose={handleCloseInquiry}
        selectedPackage={selectedPackage}
      />
    </div>
  );
}
