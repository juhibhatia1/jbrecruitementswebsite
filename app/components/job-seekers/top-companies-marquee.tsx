"use client";

import Image from "next/image";
import styles from "./top-companies-marquee.module.css";

const companyLogos = [
  { src: "/top-companies/accenture.png", alt: "Accenture" },
  { src: "/top-companies/amazon.png", alt: "Amazon" },
  { src: "/top-companies/british-council.jpg", alt: "British Council" },
  { src: "/top-companies/emirates-nbd.png", alt: "Emirates NBD" },
  { src: "/top-companies/ey.jpg", alt: "EY" },
  { src: "/top-companies/hp.png", alt: "HP" },
  { src: "/top-companies/microsoft.png", alt: "Microsoft" },
  { src: "/top-companies/noon.png", alt: "Noon" },
  { src: "/top-companies/palo-alto-networks.png", alt: "Palo Alto Networks" },
  { src: "/top-companies/sap.png", alt: "SAP" },
  { src: "/top-companies/wells-fargo.png", alt: "Wells Fargo" },
  { src: "/top-companies/apple.jpg", alt: "Apple" },
];

type TopCompaniesMarqueeProps = {
  compact?: boolean;
  className?: string;
};

export default function TopCompaniesMarquee({
  compact = false,
  className = "",
}: TopCompaniesMarqueeProps) {
  const scrollingLogos = [...companyLogos, ...companyLogos];

  if (compact) {
    return (
      <div className={className}>
        <div className="overflow-hidden">
          <div className={styles.marqueeTrack}>
            {scrollingLogos.map((logo, index) => (
              <div
                key={`${logo.alt}-${index}`}
                className="flex w-[160px] shrink-0 items-center justify-center px-5"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={120}
                  height={48}
                  className="h-8 w-auto object-contain opacity-90 transition duration-300 hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="mt-12 md:mt-16">
      <div className="overflow-hidden rounded-[2rem] border border-[#e5ebf8] bg-white px-5 py-8 shadow-[0_16px_50px_rgba(37,55,77,0.06)] md:px-8 md:py-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-[#252e3d] sm:text-3xl">
            Trusted by job seekers who&apos;ve landed at top companies
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#5b6476] sm:text-base">
            Our users have secured positions at industry-leading companies such as
          </p>
        </div>

        <div className="mt-8 overflow-hidden">
          <div className={styles.marqueeTrack}>
            {scrollingLogos.map((logo, index) => (
              <div
                key={`${logo.alt}-${index}`}
                className="flex w-[180px] shrink-0 items-center justify-center px-5"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={140}
                  height={56}
                  className="h-10 w-auto object-contain opacity-90 transition duration-300 hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
