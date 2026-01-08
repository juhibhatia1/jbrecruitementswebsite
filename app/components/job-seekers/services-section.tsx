"use client";

import React from "react";
import ServiceCard from "./service-card";
import { AiOutlineFileText, AiOutlineMail } from "react-icons/ai";
import { FaLinkedin } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { IoMdHome } from "react-icons/io";

const services = [
  {
    id: 1,
    title: "Resume Review & Rewriting",
    description: "Detailed review and rewording to make your resume stand out.",
    icon: <AiOutlineFileText size={20} />,
  },
  {
    id: 2,
    title: "Cover Letter Writing",
    description: "Custom cover letters tailored to your target roles.",
    icon: <AiOutlineMail size={20} />,
  },
  {
    id: 3,
    title: "LinkedIn Optimization",
    description: "Profile tweaks to improve visibility and recruiter interest.",
    icon: <FaLinkedin size={20} />,
  },
  {
    id: 4,
    title: "Superstar Shout-Out",
    description: "Highlighting top candidates to our hiring partners.",
    icon: <HiSparkles size={20} />,
  },
  {
    id: 5,
    title: "Ask Me Anything",
    description: "Quick consults to answer career questions and strategies.",
    icon: <IoMdHome size={20} />,
  },
];

export default function ServicesSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-8 flex items-center gap-4">
          <div className="text-[#605dba]">✨</div>
          <span className="text-sm text-[#605dba]">Our Services</span>
        </div>

        <h2 className="text-center text-3xl md:text-4xl font-semibold text-[#252e3d] mb-8">
          How We Can Help
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <p className="text-gray-700">
              Beyond core recruitment, we support your hiring process with
              thoughtful coordination, clear communication, and end-to-end
              assistance.
            </p>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {services.map((s) => (
              <ServiceCard
                key={s.id}
                title={s.title}
                description={s.description}
                icon={s.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
