export default function HeroSection() {
  return (
    <>
      {/* Fixed hero that stays in place while content scrolls over it */}
      <div className="fixed top-0 left-0 w-full h-screen z-0">
        {/* Background Image */}
        <img
          src="/home/hero-background.jpg"
          alt="Hero background"
          className="w-full h-full object-cover object-top"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />

        {/* Content (positioned over the image) */}
        <div className="absolute inset-0 flex flex-col">
          {/* Hero Content */}
          <div className="flex-1 flex items-center px-8 md:px-12 lg:px-36 py-12 md:py-0 mt-20">
            <div className="w-full max-w-7xl mx-auto">
              <div className="max-w-2xl lg:max-w-3xl">
                {/* Main Heading */}
                <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-8xl font-semibold leading-[1.1] mb-6 md:my-8">
                  <div className="">Thoughtful</div>
                  <div className="">Hiring. Real</div>
                  <div className="">Outcomes</div>
                </h1>

                {/* Subtext */}
                <p className="text-gray-300 text-base md:text-lg lg:text-xl leading-relaxed mb-8 md:mb-10 max-w-2xl w-full" style={{ fontFamily: 'Geist, sans-serif' }}>
                  We help companies hire thoughtfully and support professionals
                  through meaningful career moves — balancing speed, clarity,
                  and long-term fit.
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
      </div>

      {/* Spacer to push content below the fixed hero */}
      <div className="h-screen" aria-hidden />
    </>
  );
}
