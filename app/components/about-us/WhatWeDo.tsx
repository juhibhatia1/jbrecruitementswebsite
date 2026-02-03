"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollAnimation from "../ui/scroll-animation";
import { FaBriefcase, FaUserFriends } from "react-icons/fa";
import { IoCheckmarkCircle } from "react-icons/io5";

export default function WhatWeDo() {
  const [activeTab, setActiveTab] = useState<"company" | "seekers">("company");

  const companyItems = [
    "End-to-end recruitment support",
    "Tailored candidate sourcing",
    "Efficient shortlisting & coordination",
    "Culture and role-aligned recommendations",
  ];

  const seekerItems = [
    "Resume Review & Rewriting",
    "Cover Letter Writing",
    "LinkedIn Optimization",
    "Superstar Shout-Out (spotlighting standout talent)",
    "Career Guidance",
  ];

  return (
    <section className="w-full bg-[#FAFAFA] pb-12 md:pb-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-8 md:gap-10 lg:gap-14 items-start">
          {/* Left: Headers & Toggles */}
          <div className="md:col-span-5 lg:col-span-5">
            <ScrollAnimation variant="fadeUp">
              <h2 className="text-[#252E3D] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-3">
                What we do
              </h2>
              <p className="text-[#252E3D] text-sm sm:text-lg leading-relaxed max-w-md mb-8">
                We proudly support{" "}
                <span className="font-semibold">
                  both companies and job seekers
                </span>{" "}
                creating a balanced ecosystem where every match is purposeful.
              </p>

              {/* Toggles */}
              <div className="flex flex-col gap-3 max-w-[250px] mx-auto md:mx-0">
                {/* Company Toggle */}
                <button
                  onClick={() => setActiveTab("company")}
                  className={`relative flex items-center justify-between px-6 py-4 rounded-xl border-2 transition-all duration-300 font-bold text-lg group cursor-pointer ${
                    activeTab === "company"
                      ? "bg-[#252E3D] border-[#252E3D] text-white shadow-lg"
                      : "bg-white border-gray-200 text-gray-400 hover:border-[#252E3D] hover:text-[#252E3D] hover:bg-gray-50"
                  }`}
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  <span>Company</span>
                  <FaBriefcase
                    className={`text-xl transition-colors duration-300 ${
                      activeTab === "company"
                        ? "text-white"
                        : "text-gray-300 group-hover:text-[#252E3D]"
                    }`}
                  />
                </button>

                {/* Job Seekers Toggle */}
                <button
                  onClick={() => setActiveTab("seekers")}
                  className={`relative flex items-center justify-between px-6 py-4 rounded-xl border-2 transition-all duration-300 font-bold text-lg group cursor-pointer ${
                    activeTab === "seekers"
                      ? "bg-[#252E3D] border-[#252E3D] text-white shadow-lg scale-[1.02]"
                      : "bg-white border-gray-200 text-gray-400 hover:border-[#252E3D] hover:text-[#252E3D] hover:bg-gray-50"
                  }`}
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  <span>Job seekers</span>
                  <FaUserFriends
                    className={`text-xl transition-colors duration-300 ${
                      activeTab === "seekers"
                        ? "text-white"
                        : "text-gray-300 group-hover:text-[#252E3D]"
                    }`}
                  />
                </button>
              </div>
            </ScrollAnimation>
          </div>

          {/* Right: Dynamic List */}
          <div className="md:col-span-7 lg:col-span-7">
            <div className="space-y-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  {(activeTab === "company" ? companyItems : seekerItems).map(
                    (item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(96,93,186,0.12)] hover:border-[#605dba]/20 hover:-translate-y-0.5 transition-all duration-300"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FAFAFA] group-hover:bg-[#605dba]/10 flex items-center justify-center transition-colors duration-300">
                          <IoCheckmarkCircle className="text-gray-300 group-hover:text-[#605dba] text-xl transition-colors duration-300" />
                        </div>
                        <span className="text-[#3c4656] text-base font-medium group-hover:text-[#252E3D] transition-colors duration-300">
                          {item}
                        </span>
                      </motion.div>
                    ),
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
