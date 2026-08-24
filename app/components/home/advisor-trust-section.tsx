"use client";

import Image from "next/image";
import { PiPlugsConnectedBold } from "react-icons/pi";
import ScrollAnimation from "../ui/scroll-animation";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Items {
  id: number;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  sizeWidth: number;
  sizeHeight: number;
}

function MarqueeItems() {
  const items: Items[] = [
    {
      id: 1,
      title: "Favikon - Brand Recognition",
      description:
        "Ranked #1 Careers & Office LinkedIn Creator worldwide and #2 among the Top 10 Thought Leaders in the UAE (2025).",
      imageSrc: "/home/advisor-trust/favikon-logo.avif",
      imageAlt: "Favikon Logo",
      sizeWidth: 100,
      sizeHeight: 100,
    },
    {
      id: 2,
      title: "The Arab Icons - Industry Recognition",
      description:
        "Featured for leadership and global impact in talent acquisition and recruitment.",
      imageSrc: "/home/advisor-trust/arab-icons.avif",
      imageAlt: "Arab Icons Logo",
      sizeWidth: 100,
      sizeHeight: 100,
    },
    {
      id: 3,
      title: "The UAE Lens - Talent & Career Advocate",
      description:
        "Recognised for 11+ years of recruitment leadership across the US, Europe, Middle East, and UK.",
      imageSrc: "/home/advisor-trust/uae-lens.avif",
      imageAlt: "UAE Lens Logo",
      sizeWidth: 100,
      sizeHeight: 100,
    },
    {
      id: 4,
      title: "The World Star - Professional Leadership Spotlight",
      description:
        "Recognised for human-first recruitment leadership, mental health advocacy, and building scalable global hiring systems.",
      imageSrc: "/home/advisor-trust/1767120368951.avif",
      imageAlt: "The World Star Logo",
      sizeWidth: 100,
      sizeHeight: 100,
    },
    {
      id: 5,
      title: "Dubai Global Leaders - Talent & Business Leadership",
      description:
        "Honoured as a Dubai-based talent leader and entrepreneur driving modern, people-first recruitment at scale.",
      imageSrc: "/home/advisor-trust/dubaigloballeaders_logo.avif",
      imageAlt: "Dubai Global Leaders Logo",
      sizeWidth: 100,
      sizeHeight: 100,
    },
    {
      id: 6,
      title: "Link Hub - Global Creator Ranking",
      description:
        "Among the world's Top 50 LinkedIn creators to comment on in 2026 based on 1.7 million comment interactions.",
      imageSrc: "/home/advisor-trust/image.avif",
      imageAlt: "Link Hub Logo",
      sizeWidth: 100,
      sizeHeight: 100,
    },
    {
      id: 7,
      title: "Featured Professional Spotlight",
      description:
        "12+ years in global recruitment, championing human-first hiring and scalable systems as JB's Founder & CEO.",
      imageSrc: "/home/advisor-trust/spotlight-on-global-professional-logo.jpg",
      imageAlt: "Featured Professional Spotlight Logo",
      sizeWidth: 100,
      sizeHeight: 100,
    },
  ];

  return (
    <div className="flex gap-16 pr-16">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex w-[300px] flex-col items-center text-center"
        >
          {/* LOGO ZONE */}
          <div className="flex h-[96px] items-center justify-center mb-6">
            <Image
              src={item.imageSrc}
              alt={item.imageAlt}
              width={item.sizeWidth}
              height={item.sizeHeight}
              className="max-h-[80px] w-auto object-contain"
              unoptimized
            />
          </div>

          {/* TITLE ZONE */}
          <h4 className="min-h-[56px] text-lg font-semibold leading-snug mb-3">
            {item.title}
          </h4>

          {/* DESCRIPTION ZONE */}
          <p className="min-h-[72px] text-sm leading-relaxed text-[#c5c5c5]">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function AdvisorTrustSection() {
  const [paused, setPaused] = useState(false);
  const router = useRouter();
  return (
    <section
      className="bg-[#1b1b1b] text-white relative z-10"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      {/* ===== TOP: ADVISOR HIGHLIGHT ===== */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16 lg:py-20">
        {/* Eyebrow */}
        <div className="mb-3 md:mb-6 flex justify-center">
          <span className="mb-3 flex items-center gap-2 text-[#605dba] text-base md:text-lg font-medium">
            <PiPlugsConnectedBold size={24} />
            Thoughtful
          </span>
        </div>

        {/* Heading */}
        <ScrollAnimation variant="fadeUp">
          <h2 className="mx-auto text-center text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold leading-tight">
            Guidance you can trust at every stage of hiring.
          </h2>
        </ScrollAnimation>

        {/* Content */}
        <div className="mt-12 md:mt-20 lg:mt-12 grid grid-cols-1 gap-8 md:gap-12 lg:gap-16 lg:grid-cols-12 lg:items-center md:p-4">
          {/* Image */}
          <ScrollAnimation
            variant="scaleUp"
            delay={0.2}
            className="lg:col-span-5"
          >
            <div className="overflow-hidden rounded-3xl">
              <Image
                src="/home/advisor-trust/juhi-bhatia.avif"
                alt="Senior Recruitment Advisor"
                width={520}
                height={640}
                className="h-full w-full object-cover"
                priority
                quality={90}
              />
            </div>
          </ScrollAnimation>

          {/* Text */}
          <ScrollAnimation
            variant="slideLeft"
            delay={0.3}
            className="lg:col-span-7"
          >
            <h3 className="max-w-2xl text-lg sm:text-xl md:text-2xl lg:text-4xl font-medium leading-[1.35]">
              Hiring Is About People, Not Just Roles. Get Alignment Right, And
              Everything Else Follows.
            </h3>

            {/* Name + CTA */}
            <div className="mt-6 md:mt-8 flex items-center gap-3 md:gap-4 text-xl sm:text-2xl md:text-3xl text-[#c5c5c5]">
              <span>Juhi Bhatia</span>
              <button onClick={() => router.push('/contact-us')} className="rounded-full bg-radial-[at_50%_75%] from-[#5a58ab] to-[#5d8aba] px-4 py-1.5 text-sm cursor-pointer font-medium text-white hover:shadow-[0_6px_20px_rgba(74,144,226,0.23)] hover:scale-105 ease-in-out duration-300 ease-in-out">
                Speak
              </button>
            </div>

            {/* Divider */}
            <div className="mt-8 h-px w-full bg-white" />

            {/* Metrics */}
            <div className="mt-6 flex flex-wrap justify-between gap-8 md:gap-12 lg:gap-4 text-[#7b7b7b]">
              <div className="flex items-baseline gap-2 md:gap-3">
                <span className="text-3xl md:text-4xl font-semibold text-white">
                  84%
                </span>
                <span className="text-md sm:text-lg text-[#c5c5c5]">
                  Better role alignment
                </span>
              </div>

              <div className="flex items-baseline gap-2 md:gap-3 text-[#7b7b7b]">
                <span className="text-3xl md:text-4xl font-semibold text-white">
                  5X
                </span>
                <span className="text-md sm:text-lg text-[#c5c5c5]">
                  Honest communication
                </span>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>

      {/* ===== BOTTOM: INDUSTRY RECOGNITION ===== */}
      <div className="pb-16 md:pb-24 lg:pb-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-0">
          <ScrollAnimation variant="fadeUp" delay={0.4}>
            <div className="marquee">
              <div
                className={`marquee-track ${paused ? "paused" : ""}`}
                onClick={() => setPaused((prev) => !prev)}
              >
                {/* ===== FIRST SET ===== */}
                <MarqueeItems />
                {/* ===== DUPLICATE SET (for seamless loop) ===== */}
                <MarqueeItems />
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
