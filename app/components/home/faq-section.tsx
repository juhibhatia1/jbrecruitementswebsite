"use client";

import { useState, useEffect, useRef } from "react";
import { PiHeadsetBold } from "react-icons/pi";
import { RxArrowTopRight } from "react-icons/rx";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import ScrollAnimation from "../ui/scroll-animation";

type FAQ = {
  question: string;
  answer: string;
};

const faqs: FAQ[] = [
  {
    question: "How does JB’s recruitment process work?",
    answer:
      "We start by understanding your role, team, and expectations, then share carefully aligned profiles and stay involved through the hiring decision.",
  },
  {
    question: "How do I get started?",
    answer:
      "Simply reach out or submit your details. We’ll review them and get back to you with next steps.",
  },
  {
    question: "How long does it usually take to receive profiles?",
    answer:
      "Timelines depend on the role, but we prioritise thoughtful shortlisting over volume and keep you informed at every step.",
  },
  {
    question: "What types of roles do you hire for?",
    answer:
      "We support hiring across multiple functions and industries, focusing on quality, alignment, and long-term fit.",
  },
  {
    question: "How can JB help me in my job search?",
    answer:
      "We support you with resume review, LinkedIn optimisation, interview guidance, and access to relevant opportunities.",
  },
  {
    question: "Do I need to apply for every role separately?",
    answer:
      "No. Once you share your profile, we consider you for suitable roles and reach out when there’s a strong match.",
  },
  {
    question: "Will I receive feedback after interviews?",
    answer:
      "Whenever possible, we share feedback and next steps so you’re never left guessing.",
  },
  {
    question: "Will my information be kept confidential?",
    answer:
      "Yes. All personal and hiring information is handled with care and shared only with relevant parties.",
  },
];

export default function FAQsSection() {
  const [openIndex, setOpenIndex] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredLink, setHoveredLink] = useState(false);

  // Use scroll-based detection to reliably choose the FAQ closest to viewport center.
  useEffect(() => {
    const container = containerRef.current ?? document;
    let ticking = false;

    const computeActive = () => {
      const items = Array.from(
        (containerRef.current ?? document).querySelectorAll<HTMLElement>(
          "[data-faq]",
        ),
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

    // run once to set initial active
    computeActive();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section
      className="bg-white py-12 md:py-16 lg:py-20"
      style={{ fontFamily: "Geist, sans-seriff" }}
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
                  className="mt-4 md:mt-6 text-base md:text-lg leading-relaxed text-[#293240]"
                  style={{ fontFamily: "Palatino Linotype, sans-seriff" }}
                >
                  We’ve answered some of the most common questions from hiring
                  teams and professionals to help you understand how we work and
                  what to expect.
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
                  {/* <p className="text-md font-semibold">Need more help?</p> */}
                  <p className="mt-2 text-sm font-normal">
                    Can't find the answer you're<br /> looking for?
                  </p>

                  <div className="mt-12">
                    <a
                      href="#"
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
                    </a>
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
                    if (prev.includes(index))
                      return prev.filter((i) => i !== index);
                    return [...prev, index];
                  });
                };

                return (
                  <div
                    key={faq.question}
                    data-faq={index}
                    className={`rounded-xl border border-[#bababa] p-0 transform transition-all hover:ring-1 hover:ring-[#293240] duration-300`}
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
                      <div className="pb-3">{faq.answer}</div>
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
