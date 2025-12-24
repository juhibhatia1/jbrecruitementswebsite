import HireWithConfidence from "../components/companies/hire-with-confidence";
import WhyCompaniesPrefer from "../components/companies/why-companies-prefer";
import RecognizedSection from "../components/companies/recognized-section";
import { companiesMetadata } from "../lib/metadata";

export const metadata = companiesMetadata;

export default function CompaniesPage() {
  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <main className="pt-24">
        <HireWithConfidence />
        <WhyCompaniesPrefer />
        <RecognizedSection />
      </main>
    </div>
  );
}
