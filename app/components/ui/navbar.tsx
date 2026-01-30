"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLenis } from "../../providers/lenis-provider";
import { useRouter } from "next/navigation";

export default function NavigationMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { lenis } = useLenis();
  const router = useRouter();

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      lenis?.stop();
    } else {
      document.body.style.overflow = "unset";
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = "unset";
      lenis?.start();
    };
  }, [isMenuOpen, lenis]);

  return (
    <>
      {/* Hamburger/Close menu button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="relative bg-white px-2 py-1 md:py-1.5 lg:py-2.5 md:px-3 lg:px-3 rounded-full hover:bg-gray-100 transition-all z-50 cursor-pointer border border-[#bababa]"
      >
        {isMenuOpen ? (
          // X icon
          <div className="w-7 h-7 lg:w-8 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        ) : (
          // Hamburger icon
          <div className="flex flex-col gap-1 md:gap-1.5 w-7 h-7 lg:w-8 justify-center">
            <div className="w-7 h-0.5 md:w-7 md:h-0.75 lg:w-full bg-gray-900 rounded py-[1.2px]"></div>
            <div className="w-5 h-0.5 md:h-0.75 bg-gray-900 rounded py-[1.2px]"></div>
          </div>
        )}
      </button>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-[#18191b] backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-95" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="h-full flex flex-col justify-between p-6 sm:p-8 md:p-12 lg:p-16 lg:px-32 xl:px-56 lg:py-24 xl:py-30">
          {/* Menu Items */}
          <div className="flex-1 flex flex-col justify-center space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
            <div className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold transition-colors">
              <span
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push("/");
                }}
                className="hover:bg-linear-to-r hover:bg-clip-text hover:text-transparent hover:from-[#605DBA] hover:to-[#3F78E0] cursor-pointer inline-block"
              >
                HOME
              </span>
            </div>
            <div className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold transition-colors">
              <span
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push("/companies");
                }}
                className="hover:bg-linear-to-r hover:bg-clip-text hover:text-transparent hover:from-[#605DBA] hover:to-[#3F78E0] cursor-pointer inline-block"
              >
                COMPANIES
              </span>
            </div>
            <div className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold transition-colors">
              <span
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push("/job-seekers");
                }}
                className="hover:bg-linear-to-r hover:bg-clip-text hover:text-transparent hover:from-[#605DBA] hover:to-[#3F78E0] cursor-pointer inline-block"
              >
                JOB SEEKERS
              </span>
            </div>
            <div className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold transition-colors">
              <span
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push("/about-us");
                }}
                className="hover:bg-linear-to-r hover:bg-clip-text hover:text-transparent hover:from-[#605DBA] hover:to-[#3F78E0] cursor-pointer inline-block"
              >
                ABOUT US
              </span>
            </div>
            <div className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold transition-colors">
              <span
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push("/contact-us");
                }}
                className="hover:bg-linear-to-r hover:bg-clip-text hover:text-transparent hover:from-[#605DBA] hover:to-[#3F78E0] cursor-pointer inline-block"
              >
                CONTACT US
              </span>
            </div>

            {/* Underline */}
            <div className="w-full max-w-sm h-px bg-white md:mb-8"></div>

            <div className="flex items-center gap-6 md:gap-8">
              <Link
                href="https://www.linkedin.com/in/juhiibhatia/"
                className="text-white hover:text-[#605DBA] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="w-7 h-7 md:w-8 md:h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </Link>
              <Link
                href="https://www.instagram.com/juhibhatia_globalrecruiter/"
                className="text-white hover:text-[#605DBA] transition-colors relative group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="w-7 h-7 md:w-8 md:h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-white hover:text-[#605DBA] transition-colors relative group"
              >
                <svg
                  className="w-7 h-7 md:w-8 md:h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Coming Soon
                </span>
              </Link>
              <Link
                href="#"
                className="text-white hover:text-[#605DBA] transition-colors relative group"
              >
                <svg
                  className="w-7 h-7 md:w-8 md:h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Coming Soon
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
