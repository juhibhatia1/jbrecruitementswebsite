"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer
      className="relative z-20 bg-white border-t border-[#bababa]"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-10">
        {/* Top Row */}
        <div className="flex flex-col gap-12 items-center md:flex-row md:items-center md:justify-between">
          {/* Left: Logo + Nav */}
          <div className="flex flex-col items-center md:items-start w-full md:w-auto">
            {/* Logo */}
            <Image
              src="/logo.avif"
              alt="JobBoard Logo"
              width={100}
              height={100}
              className="mb-3"
            />

            {/* Navigation */}
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 font-medium text-base text-[#252E3D] md:justify-start">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <Link href="/companies" className="hover:underline">
                Companies
              </Link>
              <Link href="/job-seekers" className="hover:underline">
                Job Seekers
              </Link>

              {/* Force line break on mobile only */}
              <div className="w-full md:hidden"></div>

              <Link href="/about-us" className="hover:underline">
                About Us
              </Link>
              <Link href="/contact-us" className="hover:underline">
                Contact Us
              </Link>
              <Link href="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* Right: Social Icons */}
          <div className="flex items-center justify-center gap-6 text-[#252E3D] w-full md:w-auto">
            {/* LinkedIn */}
            <Link
              href="https://www.linkedin.com/in/juhiibhatia/"
              aria-label="LinkedIn"
              className="hover:text-[#252E3D]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/footer/linkedin-logo.avif"
                alt="LinkedIn"
                width={20}
                height={20}
                className="h-5 w-5"
                loading="lazy"
              />
            </Link>

            {/* Instagram */}
            <Link
              href="https://www.instagram.com/juhibhatia_globalrecruiter/"
              aria-label="Instagram"
              className="hover:text-slate-900 relative group"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/footer/instagram-logo.avif"
                alt="Instagram"
                width={20}
                height={20}
                className="h-5 w-5"
                loading="lazy"
              />
            </Link>

            {/* Facebook */}
            {/* <Link
              href="#"
              aria-label="Facebook"
              className="hover:text-slate-900 relative group"
            >
              <img
                src="/footer/facebook-logo.avif"
                alt="Facebook"
                className="h-5 w-5"
              />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Coming Soon
              </span>
            </Link> */}

            {/* X (Twitter) */}
            {/* <Link
              href="#"
              aria-label="X"
              className="hover:text-slate-900 relative group"
            >
              <img
                src="/footer/twitter-logo.avif"
                alt="X"
                className="h-5 w-5"
              />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Coming Soon
              </span>
            </Link> */}
          </div>
        </div>

        {/* Divider */}
        <div className="my-3 lg:my-4 h-px w-full bg-[#C4C4C4]" />
      </div>
    </footer>
  );
}
