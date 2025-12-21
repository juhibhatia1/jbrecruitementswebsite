import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-20 bg-white border-t border-[#bababa]" style={{ fontFamily: "Geist, sans-serif" }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10">
        {/* Top Row */}
        <div className="flex flex-col gap-12 items-center md:flex-row md:items-center md:justify-between">
          {/* Left: Logo + Nav */}
          <div className="flex flex-col items-center md:items-start w-full md:w-auto">
            {/* Logo */}
            <div className="mb-8 text-4xl md:text-5xl font-bold tracking-tight text-black" style={{ fontFamily: "Palatino Linotype, sans-seriff" }}>
              JB
            </div>

            {/* Navigation */}
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 font-medium text-base text-[#252E3D] md:justify-start">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <Link href="/hr" className="hover:underline">
                HR
              </Link>
              <Link href="/job-seekers" className="hover:underline">
                Job Seekers
              </Link>
              
              {/* Force line break on mobile only */}
              <div className="w-full md:hidden"></div>
              
              <Link href="/about" className="hover:underline">
                About
              </Link>
              <Link href="/contact" className="hover:underline">
                Contact
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
              <img
                src="/footer/linkedin-logo.png"
                alt="LinkedIn"
                className="h-5 w-5"
              />
            </Link>

            {/* Facebook */}
            <Link
              href="https://www.facebook.com"
              aria-label="Facebook"
              className="hover:text-slate-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/footer/facebook-logo.png"
                alt="Facebook"
                className="h-5 w-5"
              />
            </Link>

            {/* X (Twitter) */}
            <Link
              href="https://twitter.com"
              aria-label="X"
              className="hover:text-slate-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/footer/twitter-logo.png" alt="X" className="h-5 w-5" />
            </Link>

            {/* Instagram */}
            <Link
              href="https://www.instagram.com"
              aria-label="Instagram"
              className="hover:text-slate-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/footer/instagram-logo.png"
                alt="Instagram"
                className="h-5 w-5"
              />
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="my-3 lg:my-4 h-px w-full bg-[#C4C4C4]" />

        {/* Bottom */}
        <div className="text-sm lg:text-lg text-[#252E3D] text-center md:text-left">© Copyright 2025</div>
      </div>
    </footer>
  );
}
