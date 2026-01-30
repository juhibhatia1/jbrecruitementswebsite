"use client";

import Link from "next/link";
import FloatingNavbar from "./components/floating-navbar";
import { RxArrowTopRight } from "react-icons/rx";
import ScrollAnimation from "./components/ui/scroll-animation";
import Image from "next/image";

export default function NotFound() {
  return (
    <div
      className="relative bg-white overflow-hidden"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <FloatingNavbar />
      {/* Subtle diagonal background */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* 404 */}
        <ScrollAnimation variant="scaleUp" delay={0.1}>
          <Image
            src={"/not-found/404.avif"}
            alt="404.avif"
            className="w-full h-full"
            width={300}
            height={400}
          />
        </ScrollAnimation>

        {/* Title */}
        <ScrollAnimation variant="fadeUp" delay={0.2}>
          <h2 className="my-4 lg:my-6 text-xl font-semibold text-[#252e3d] md:text-2xl lg:text-5xl">
            Oops! something off
          </h2>
        </ScrollAnimation>

        {/* Description */}
        <ScrollAnimation variant="fadeUp" delay={0.3}>
          <p
            className="mt-2 max-w-md text-sm text-[#252E3D] md:text-base lg:text-xl"
            style={{ fontFamily: "Crimson Text, serif" }}
          >
            The page you were looking for can't be found.
          </p>
        </ScrollAnimation>

        {/* CTA */}
        <ScrollAnimation variant="fadeUp" delay={0.4}>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#252e3d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#252e3d]"
          >
            Sip &amp; Restart
            <RxArrowTopRight size={20} />
          </Link>
        </ScrollAnimation>
      </div>
    </div>
  );
}
