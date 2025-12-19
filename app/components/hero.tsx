import React from "react";
import NavigationMenu from "./navbar";

export default function HeroSection() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/home/hero-background.jpg')",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-8 md:px-12 lg:px-16 pt-6 md:pt-8">
          {/* Logo */}
          <div className="bg-white rounded-full px-5 py-1 md:px-5">
            <img
              src={"/home/logo.png"}
              alt="JB Logo"
              className="h-6 md:h-12 w-12"
            />
          </div>

          {/* Right side navigation */}
          <div className="flex items-center gap-3 md:gap-2">
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
        </nav>

        {/* Hero Content */}
        <div className="flex-1 flex items-center px-8 md:px-12 lg:px-16 py-12 md:py-0">
          <div className="w-full max-w-7xl mx-auto">
            <div className="max-w-2xl lg:max-w-3xl">
              {/* Main Heading */}
              <h1 className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-6 md:mb-8">
                <div className="font-light">Thoughtful</div>
                <div className="font-light">Hiring. Real</div>
                <div className="font-light">Outcomes</div>
              </h1>

              {/* Subtext */}
              <p className="text-gray-300 text-base md:text-lg lg:text-xl leading-relaxed mb-8 md:mb-10 max-w-xl font-light">
                We help companies hire thoughtfully and support professionals
                through meaningful career moves — balancing speed, clarity, and
                long-term fit.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-[#3399FE] text-white px-7 py-3.5 md:px-8 md:py-4 rounded-full text-base md:text-lg font-medium hover:bg-[#285b8d] transition-all shadow-lg cursor-pointer">
                  Build Your Team
                </button>

                <button className="bg-transparent border border-white/80 text-white px-7 py-3.5 md:px-8 md:py-4 rounded-full text-base md:text-lg font-medium hover:scale-105 transform transition-all backdrop-blur-sm ease-in-out duration-300 cursor-pointer">
                  Explore Opportunities
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Image on Right (visible on larger screens) */}
      {/* <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/3 xl:w-2/5">
        <div className="relative h-full">
          <img 
            src="/hero-background.jpg" 
            alt="Professional" 
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)'
            }}
          />
        </div>
      </div> */}
    </div>
  );
}
