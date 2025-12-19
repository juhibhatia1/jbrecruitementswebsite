import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20">
        {/* Top Row */}
        <div className="flex flex-col gap-12 md:flex-row md:items-center md:justify-between">
          {/* Left: Logo + Nav */}
          <div>
            {/* Logo */}
            <div className="mb-8 text-5xl font-semibold tracking-tight text-slate-900">
              JB
            </div>

            {/* Navigation */}
            <nav className="flex flex-wrap gap-6 text-base text-slate-900">
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
            <a
              href="#"
              aria-label="LinkedIn"
              className="hover:text-slate-900"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0 24V7h5v17H0zm7.5-17H12v2.5h.07c.63-1.2 2.18-2.5 4.43-2.5 4.74 0 5.5 3.1 5.5 7.1V24h-5v-7.6c0-1.8-.03-4.1-2.5-4.1s-2.9 1.9-2.9 4V24h-5V7z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-slate-900"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.325v21.351C0 23.4.6 24 1.325 24h11.495v-9.294H9.691V11.01h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.505 0-1.796.716-1.796 1.764v2.316h3.59l-.467 3.696h-3.123V24h6.116C23.4 24 24 23.4 24 22.675V1.325C24 .6 23.4 0 22.675 0z" />
              </svg>
            </a>

            {/* X (Twitter) */}
            <a
              href="#"
              aria-label="X"
              className="hover:text-slate-900"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26L22.845 21.75h-6.62l-5.21-6.8-5.95 6.8H1.757l7.73-8.84L1.155 2.25h6.79l4.713 6.23 5.586-6.23z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="#"
              aria-label="Instagram"
              className="hover:text-slate-900"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.366.062 2.633.33 3.608 1.305.975.975 1.243 2.242 1.305 3.608.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.33 2.633-1.305 3.608-.975.975-2.242 1.243-3.608 1.305-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.33-3.608-1.305-.975-.975-1.243-2.242-1.305-3.608C2.212 15.584 2.2 15.2 2.2 12s.012-3.584.07-4.85c.062-1.366.33-2.633 1.305-3.608C4.55 2.6 5.817 2.332 7.183 2.27 8.45 2.212 8.833 2.2 12 2.2zm0-2.2C8.741 0 8.332.013 7.052.072 5.771.13 4.6.39 3.635 1.355 2.67 2.32 2.41 3.491 2.352 4.772.293 8.332.293 15.668 2.352 19.228c.058 1.281.318 2.452 1.283 3.417.965.965 2.136 1.225 3.417 1.283C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.058 2.452-.318 3.417-1.283.965-.965 1.225-2.136 1.283-3.417C23.707 15.668 23.707 8.332 21.648 4.772c-.058-1.281-.318-2.452-1.283-3.417-.965-.965-2.136-1.225-3.417-1.283C15.668.013 15.259 0 12 0z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-16 h-px w-full bg-slate-200" />

        {/* Bottom */}
        <div className="mt-6 text-sm text-slate-900">
          © Copyright 2025
        </div>
      </div>
    </footer>
  );
}
