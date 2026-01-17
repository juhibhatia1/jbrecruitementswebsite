"use client";
import Image from "next/image";
import NavigationMenu from "./ui/navbar";
import { useRouter } from "next/navigation";

export default function FloatingNavbar() {
  const router = useRouter();
  return (
    <>
      <nav
        className="fixed left-0 right-0 top-2 z-50"
        style={{ fontFamily: "Geist, sans-seriff" }}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo (left) */}
            <button
              className="bg-white rounded-full px-3 py-1 md:py-0.5 lg:py-1 md:px-4 lg:px-5 border border-[#bababa] cursor-pointer"
              onClick={() => router.push("/")}
            >
              <Image
                width={80}
                height={80}
                src="/logo.png"
                alt="JB Recruitment Solutions - HR Consulting & Talent Acquisition"
                className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12"
                priority
              />
            </button>

            {/* Right side navigation (actions) */}
            <div className="flex items-center gap-3 md:gap-4">
              <button
                className="contact-ring relative bg-transparent rounded-full px-3 py-1 md:py-0.5 lg:py-1 md:px-4 lg:px-5 text-xs sm:text-sm md:text-base font-semibold cursor-pointer"
                onClick={() => router.push("/contact-us")}
              >
                <span aria-hidden className="contact-ring-outer" />

                <div className="relative z-10 bg-[#252e3d] hover:bg-[#3399FE] border-4 border-white px-3 py-1.5 sm:px-3.5 sm:py-2 md:px-4 md:py-2 lg:px-5 lg:py-2.5 rounded-full flex items-center gap-1.5 sm:gap-2">
                  <span className="text-white">Contact</span>

                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="dot dot-1" />
                    <span className="dot dot-2" />
                    <span className="dot dot-3" />
                  </div>
                </div>
              </button>

              <NavigationMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* spacer removed so navbar floats over the hero section */}
    </>
  );
}
