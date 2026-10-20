"use client";

import { useState, useEffect, useRef } from "react";
import { PiHeadsetBold } from "react-icons/pi";
import { RxArrowTopRight } from "react-icons/rx";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import ScrollAnimation from "../ui/scroll-animation";
import Link from "next/link";
import { useDetectCurrency } from "@/lib/hooks/useDetectCurrency";

type FAQ = {
  question: string;
  answer: string;
};

const faqs: FAQ[] = [
  {
    question: "How does the ghostwriting process preserve my authentic voice?",
    answer:
      "We capture your tone, viewpoints, and vocabulary during a 45-minute kickoff interview. Every post is custom-drafted and approved by you before publishing-never generic automated AI text.",
  },
  {
    question: "How much of my time is required?",
    answer:
      "Just 30–45 minutes every two weeks for a voice alignment sync. Our team handles all research, writing, scheduling, and engagement.",
  },
  {
    question: "Do I have final approval over every post before it goes live?",
    answer:
      "Yes, 100%. Nothing is ever posted without your explicit review and sign-off on the content calendar.",
  },
  {
    question: "Who is this service best suited for?",
    answer:
      "Founders, executives, consultants, and leaders who want industry authority and inbound opportunities without managing daily content.",
  },
  {
    question: "What is the difference between the 3-Month and 6-Month plans?",
    answer:
      "The 3-Month Launch builds your core presence and voice ($3,000 USD / ₹2,65,000 INR). The 6-Month Authority scales reach with continuous optimization and proactive executive network growth ($5,000 USD / ₹4,85,000 INR). Both plans are eligible for your consultation credit deduction.",
  },
  {
    question: "How does the initial consultation fee and credit policy work?",
    answer:
      "A 1-on-1 strategy consultation with Juhi Bhatia is $299 USD (or ₹24,999 INR). If you decide to proceed with either our 3-Month or 6-Month retainer package, your entire consultation fee is credited and decremented directly from your package price.",
  },
  {
    question: "What results can I realistically expect?",
    answer:
      "Noticeable gains in visibility, credibility, and inbound inquiries. We prioritize high-trust, genuine industry influence over short-lived vanity metrics.",
  },
  {
    question: "How quickly do we launch after onboarding?",
    answer:
      "Your audit and kickoff interview happen within 48–72 hours. Your first curated content calendar goes live in week two.",
  },
  {
    question: "Do you offer packages for leadership or corporate teams?",
    answer:
      "Yes. We design customized multi-executive packages for corporate leadership teams upon consultation.",
  },
];

interface BrandingFaqProps {
  onOpenInquiry?: (pkg?: "3-month" | "6-month" | "general") => void;
}

export default function BrandingFaq({ onOpenInquiry }: BrandingFaqProps) {
  const currency = useDetectCurrency();
  const isIndianUser = currency === "INR";
  const [openIndex, setOpenIndex] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredLink, setHoveredLink] = useState(false);

  // Scroll-based detection to highlight the FAQ closest to viewport center
  useEffect(() => {
    let ticking = false;

    const computeActive = () => {
      const items = Array.from(
        (containerRef.current ?? document).querySelectorAll<HTMLElement>(
          "[data-faq]"
        )
      );
      if (!items.length) return;

      const viewportCenter = window.innerHeight / 2;
      let bestIndex = 0;
      let bestDistance = Infinity;

      items.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elCenter - viewportCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = idx;
        }
      });

      setActiveIndex(bestIndex);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(computeActive);
      }
    };

    computeActive();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section
      className="bg-white py-12 md:py-16 lg:py-20 border-t border-gray-100"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:gap-14 lg:grid-cols-12">
          {/* LEFT (sticky) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <ScrollAnimation variant="fadeUp">
                <div className="mb-3 flex items-center gap-2 text-[#605dba] text-base md:text-lg font-medium">
                  <PiHeadsetBold size={20} className="text-[#605dba]" />
                  FAQs
                </div>

                <h2 className="text-[#252e3d] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  Answers to Common Questions
                </h2>

                <p
                  className="mt-3 md:mt-4 text-sm sm:text-base leading-relaxed text-gray-600"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Key details on our ghostwriting workflow, approval process, timelines, and package deliverables.
                </p>

                {/* Help Card */}
                <div
                  className="mt-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 p-6 text-white text-right"
                  style={{
                    backgroundImage: "url('/home/faq-background.avif')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <p className="mt-2 text-sm font-normal">
                    Can&apos;t find the answer you&apos;re
                    <br /> looking for?
                  </p>

                  <div className="mt-12">
                    {onOpenInquiry ? (
                      <button
                        onClick={() => onOpenInquiry("general")}
                        className="inline-flex items-center gap-1 text-base md:text-lg font-medium text-white hover:text-white/90 border-b border-white transition duration-300 ease-in-out cursor-pointer"
                        onMouseEnter={() => setHoveredLink(true)}
                        onMouseLeave={() => setHoveredLink(false)}
                      >
                        Request Consultation
                        <RxArrowTopRight
                          size={16}
                          className={`transform transition-transform duration-300 ${
                            hoveredLink ? "rotate-45 translate-x-1" : "rotate-0"
                          }`}
                        />
                      </button>
                    ) : (
                      <Link
                        href="/contact-us"
                        className="inline-flex items-center gap-1 text-base md:text-lg font-medium text-white hover:text-white/90 border-b border-white transition duration-300 ease-in-out"
                        onMouseEnter={() => setHoveredLink(true)}
                        onMouseLeave={() => setHoveredLink(false)}
                      >
                        Contact Us
                        <RxArrowTopRight
                          size={16}
                          className={`transform transition-transform duration-300 ${
                            hoveredLink ? "rotate-45 translate-x-1" : "rotate-0"
                          }`}
                        />
                      </Link>
                    )}
                  </div>
                </div>
              </ScrollAnimation>
            </div>
          </div>

          {/* RIGHT (scrollable FAQs with animation) */}
          <div ref={containerRef} className="lg:col-span-7">
            <ScrollAnimation variant="fadeUp" delay={0.2} className="space-y-6">
              {faqs.map((faq, index) => {
                const isOpen = openIndex.includes(index);

                const toggleOpen = () => {
                  setOpenIndex((prev) => {
                    if (prev.includes(index)) {
                      return prev.filter((i) => i !== index);
                    }
                    return [...prev, index];
                  });
                };

                return (
                  <div
                    key={faq.question}
                    data-faq={index}
                    className="rounded-xl border border-[#bababa] p-0 transform transition-all hover:ring-1 hover:ring-[#293240] duration-300"
                  >
                    <button
                      onClick={toggleOpen}
                      className="flex w-full items-center justify-between px-6 py-5 text-left cursor-pointer"
                    >
                      <span className="text-sm sm:text-base md:text-lg font-semibold text-[#293240]">
                        {faq.question}
                      </span>

                      <span className="text-slate-500 transition-transform duration-200">
                        {isOpen ? (
                          <FiChevronUp className="w-5 h-5" />
                        ) : (
                          <FiChevronDown className="w-5 h-5" />
                        )}
                      </span>
                    </button>

                    <div
                      className="px-6 text-sm md:text-base leading-relaxed text-[#7b7b7b] overflow-hidden transition-all duration-300"
                      style={{
                        maxHeight: isOpen ? "480px" : "0px",
                        opacity: isOpen ? 1 : 0,
                      }}
                      aria-hidden={!isOpen}
                    >
                      <div className="pb-3">
                        {faq.question.includes("3-Month and 6-Month plans")
                          ? isIndianUser
                            ? "The 3-Month Launch (₹2,65,000 INR) builds your core presence and voice. The 6-Month Authority (₹4,85,000 INR) scales reach with continuous optimization and proactive executive network growth."
                            : "The 3-Month Launch ($3,000 USD) builds your core presence and voice. The 6-Month Authority ($5,000 USD) scales reach with continuous optimization and proactive executive network growth."
                          : faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </ScrollAnimation>
          </div>
        </div>
      </div>
    </section>
  );
}
