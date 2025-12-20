"use client";
import NavigationMenu from "./ui/navbar";

export default function FloatingNavbar() {
  return (
    <>
      <nav className="fixed left-0 right-0 top-2 z-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo (left) */}
            <div className="bg-white rounded-full px-4 py-1 md:px-5 border border-[#bababa]">
              <img
                src="/home/logo.png"
                alt="JB Logo"
                className="h-6 md:h-12 w-12"
              />
            </div>

            {/* Right side navigation (actions) */}
            <div className="flex items-center gap-3 md:gap-4">
              <button className="contact-ring relative bg-white rounded-full p-1 text-sm md:text-base font-semibold hover:bg-gray-100 transition-all cursor-pointer">
                <span aria-hidden className="contact-ring-outer" />

                <div className="relative z-10 bg-[#252e3d] px-4 py-2 md:px-4 md:py-2 rounded-full flex items-center gap-2">
                  <span className="text-white">Contact</span>

                  <div className="flex items-center gap-1.5">
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
