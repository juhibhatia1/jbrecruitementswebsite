import AboutHero from "../components/about-us/AboutHero";
import MissionVision from "../components/about-us/MissionVision";
import WhatWeDo from "../components/about-us/WhatWeDo";
import FounderSection from "../components/about-us/FounderSection";
import { aboutMetadata } from "../lib/metadata";
import RecognizedSection from "../components/about-us/recognized-section";

export const metadata = aboutMetadata;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-0 sm:pt-10">
      <main>
        <AboutHero />
        <MissionVision />
        <WhatWeDo />
        <RecognizedSection />
      </main>
    </div>
  );
}
