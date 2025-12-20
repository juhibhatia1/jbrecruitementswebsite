import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-20 bg-white border-t border-[#bababa]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Top Row */}
        <div className="flex flex-col gap-12 md:flex-row md:items-center md:justify-between">
          {/* Left: Logo + Nav */}
          <div>
            {/* Logo */}
            <div className="mb-8 text-5xl font-bold tracking-tight text-slate-900">
              JB
            </div>

            {/* Navigation */}
            <nav className="flex flex-wrap gap-8 font-medium text-base text-slate-900">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <Link href="/hr" className="hover:underline">
                HR
              </Link>
              <Link href="/careers" className="hover:underline">
                Carrers
              </Link>
              <Link href="/blog" className="hover:underline">
                Blog
              </Link>
              <Link href="/about" className="hover:underline">
                About
              </Link>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </nav>
          </div>

          {/* Right: Social Icons */}
          <div className="flex items-center gap-6 text-slate-700">
            {/* LinkedIn */}
            <Link
              href="https://www.linkedin.com"
              aria-label="LinkedIn"
              className="hover:text-slate-900"
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
        <div className="mt-8 h-px w-full bg-slate-200" />

        {/* Bottom */}
        <div className="mt-6 text-sm text-slate-900">© Copyright 2025</div>
      </div>
    </footer>
  );
}
