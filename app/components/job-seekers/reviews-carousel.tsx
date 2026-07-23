"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { RxArrowTopRight } from "react-icons/rx";

type Review = {
  name: string;
  role: string;
  review: string;
};

const REVIEWS: Review[] = [
  {
    name: "Simona Nyagolova",
    role: "Sales Development Representative at GoDaddy",
    review:
      "Highly recommend Juhi's services! Very professional, on time and genuinely does a great job at her requests.",
  },
  {
    name: "BriAnna Beard, M.A.",
    role: "Supervisor at Adidas",
    review:
      "Juhi was great! She was able to revise my resume and optimize my LinkedIn and I am extremely satisfied. I will absolutely be recommending her to others.",
  },
  {
    name: "Carlos Augusto, PHR",
    role: "Human Resources & Military Operations Expert",
    review:
      "I am pleased with Juhi's services. Once I got my new resume, I started getting interview calls. That is wild! Give it a try. I recommend it.",
  },
  {
    name: "Kartik Pittie",
    role: "Sales Executive",
    review:
      "Professional, efficient, and high quality. She refined structure and language with strong judgment, resulting in a markedly sharper and more effective CV.",
  },
  {
    name: "Nikolay Barabanshikov",
    role: "Broadcast Operations & Integration Specialist",
    review:
      "Had a great experience with Juhi for a CV rewrite and QA session. Strong questions, clear process, and a CV that’s sharper and more convincing. Highly recommended.",
  },
];

const ROTATE_MS = 10000;

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ReviewsCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setActive((index + REVIEWS.length) % REVIEWS.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setActive((prev) => (prev + 1) % REVIEWS.length),
      ROTATE_MS,
    );
    return () => clearInterval(id);
  }, [paused]);

  const current = REVIEWS[active];

  return (
    <div
      className="mt-8 flex flex-col rounded-3xl lg:rounded-2xl border border-[#e5ebf8] bg-[#26292d] p-5 lg:p-4 text-white shadow-sm sm:p-6 lg:mt-4 lg:h-full lg:flex-1"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header + arrows */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
          Real results, real people
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Previous review"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <IoChevronBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Next review"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <IoChevronForward className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Rotating review — fills and centers in the available space */}
      <div className="flex flex-1 flex-col justify-center py-6 lg:py-4">
        <div key={active} className="animate-fadeIn">
          <div className="flex gap-0.5 text-[#f5b942]" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.9l-5.2 2.6.99-5.79-4.21-4.1 5.82-.85z" />
              </svg>
            ))}
          </div>

          <p className="mt-4 text-base leading-7 text-white/90 sm:text-lg">
            “{current.review}”
          </p>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold leading-none text-white">
              <span className="translate-y-px">{initials(current.name)}</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white">{current.name}</p>
              <p className="text-xs text-white/50">{current.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dots + view more */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="flex items-center gap-1.5">
          {REVIEWS.map((review, index) => (
            <button
              key={review.name}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Show review from ${review.name}`}
              aria-current={index === active}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === active
                  ? "w-6 bg-white"
                  : "w-2 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        <Link
          href="https://www.linkedin.com/services/page/71481432514867b3ab/"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#252e3d] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.12)]"
        >
          View more reviews
          <RxArrowTopRight className="h-4 w-4 transform transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
