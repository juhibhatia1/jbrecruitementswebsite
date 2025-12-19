"use client";

import { useState } from "react";

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
      "You can get started by reaching out through our contact form or booking an introductory call to discuss your hiring needs.",
  },
  {
    question: "How long does it usually take to receive profiles?",
    answer:
      "Timelines vary by role, but most clients receive initial profiles within 7–10 business days after alignment.",
  },
  {
    question: "What types of roles do you hire for?",
    answer:
      "We support hiring across technical, commercial, leadership, and specialist roles across industries.",
  },
  {
    question: "How can JB help me in my job search?",
    answer:
      "We focus on alignment, career direction, and transparent communication — supporting you beyond just interview preparation.",
  },
  {
    question: "Do I need to apply for every role separately?",
    answer:
      "No. Once we understand your profile and goals, we proactively align you with relevant opportunities.",
  },
  {
    question: "Will I receive feedback after interviews?",
    answer:
      "Yes. We prioritise honest, constructive feedback to help candidates grow and make informed decisions.",
  },
];

export default function FAQsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          {/* LEFT */}
          <div className="lg:col-span-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100">
                🎧
              </span>
              FAQs
            </div>

            <h2 className="text-[40px] font-semibold leading-[1.2] tracking-tight text-slate-900">
              Answers to Common Questions
            </h2>

            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              We’ve answered some of the most common questions from hiring teams
              and professionals to help you understand how we work and what to
              expect.
            </p>

            {/* Help Card */}
            <div className="mt-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 p-6 text-white">
              <p className="text-sm font-medium">Need more help?</p>
              <p className="mt-2 text-sm text-white/80">
                We’re here to answer any questions you may have.
              </p>

              <button className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
                Ask a Question
                <span aria-hidden>↗</span>
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-8">
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                  <div
                    key={faq.question}
                    className="rounded-xl border border-slate-200"
                  >
                    <button
                      onClick={() =>
                        setOpenIndex(isOpen ? null : index)
                      }
                      className="flex w-full items-center justify-between px-6 py-5 text-left"
                    >
                      <span className="text-base font-medium text-slate-900">
                        {faq.question}
                      </span>

                      <span
                        className={`transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        ▾
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 text-sm leading-relaxed text-slate-600">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
