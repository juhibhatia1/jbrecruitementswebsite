import Image from "next/image";
import { PiPlugsConnectedBold } from "react-icons/pi";
import ScrollAnimation from "../ui/scroll-animation";

export default function AdvisorTrustSection() {
  return (
    <section
      className="bg-[#1b1b1b] text-white"
      style={{ fontFamily: "Geist, sans-seriff" }}
    >
      {/* ===== TOP: ADVISOR HIGHLIGHT ===== */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16 lg:py-20">
        {/* Eyebrow */}
        <div className="mb-4 md:mb-6 flex justify-center">
          <span className="mb-3 flex items-center gap-2 text-[#605dba] text-base md:text-lg font-medium">
            <PiPlugsConnectedBold size={24} />
            Thoughtful
          </span>
        </div>

        {/* Heading */}
        <ScrollAnimation variant="fadeUp">
          <h2 className="mx-auto text-center text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
            Guidance you can trust at every stage of
            <br className="hidden sm:block" />
            hiring.
          </h2>
        </ScrollAnimation>

        {/* Content */}
        <div className="mt-12 md:mt-20 lg:mt-24 grid grid-cols-1 gap-8 md:gap-12 lg:gap-16 lg:grid-cols-12 lg:items-center md:p-4">
          {/* Image */}
          <ScrollAnimation
            variant="scaleUp"
            delay={0.2}
            className="lg:col-span-5"
          >
            <div className="overflow-hidden rounded-3xl">
              <Image
                src="/home/advisor-trust/juhi-bhatia.avif"
                alt="Senior Recruitment Advisor"
                width={520}
                height={640}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </ScrollAnimation>

          {/* Text */}
          <ScrollAnimation
            variant="slideLeft"
            delay={0.3}
            className="lg:col-span-7"
          >
            <h3 className="max-w-2xl text-lg sm:text-xl md:text-2xl lg:text-4xl font-medium leading-[1.35]">
              Hiring Is About People, Not Just Roles. Get Alignment Right, And
              Everything Else Follows.
            </h3>

            {/* Name + CTA */}
            <div className="mt-6 md:mt-8 flex items-center gap-3 md:gap-4 text-xl sm:text-2xl md:text-3xl text-[#c5c5c5]">
              <span>Juhi Bhatia</span>
              <button className="rounded-full bg-radial-[at_50%_75%] from-[#5a58ab] to-[#5d8aba] px-4 py-1.5 text-sm font-medium text-white">
                Speak
              </button>
            </div>

            {/* Divider */}
            <div className="mt-8 h-px w-full bg-white" />

            {/* Metrics */}
            <div className="mt-6 flex flex-wrap justify-between gap-8 md:gap-12 lg:gap-16 text-[#7b7b7b]">
              <div className="flex items-baseline gap-2 md:gap-3">
                <span className="text-3xl md:text-4xl font-semibold text-white">
                  84%
                </span>
                <span className="text-md sm:text-lg text-[#c5c5c5]">
                  Better role alignment
                </span>
              </div>

              <div className="flex items-baseline gap-2 md:gap-3 text-[#7b7b7b]">
                <span className="text-3xl md:text-4xl font-semibold text-white">
                  5X
                </span>
                <span className="text-md sm:text-lg text-[#c5c5c5]">
                  Honest communication
                </span>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>

      {/* ===== BOTTOM: INDUSTRY RECOGNITION ===== */}
      <div className="pb-16 md:pb-24 lg:pb-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
          <ScrollAnimation
            variant="fadeUp"
            delay={0.4}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-6"
          >
            {/* Item 1 */}
            <div className="flex flex-col items-center text-center md:border-r md:border-white/20 md:px-4 lg:px-6">
              <div className="mb-6 flex h-[100px] w-full max-w-[120px] items-center justify-center">
                <Image
                  src={"/home/advisor-trust/arab-icons.avif"}
                  alt="Arab Icons Logo"
                  width={100}
                  height={100}
                  className="h-full w-auto object-contain"
                  unoptimized
                />
              </div>
              <h4
                className="text-lg md:text-xl lg:text-2xl font-semibold mb-3"
                style={{ fontFamily: "Palatino Linotype, sans-seriff" }}
              >
                Industry Recognition
              </h4>
              <p className="text-sm md:text-base leading-relaxed text-[#c5c5c5] max-w-xs">
                Featured by The Arab Icons for leadership and impact in global
                talent acquisition.
              </p>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col items-center text-center md:border-r md:border-white/20 md:px-4 lg:px-6">
              <div className="mb-6 flex h-[100px] w-full max-w-[120px] items-center justify-center">
                <Image
                  src="/home/advisor-trust/favikon-logo.avif"
                  alt="Favikon Logo"
                  width={100}
                  height={100}
                  className="h-full w-auto object-contain"
                  unoptimized
                />
              </div>
              <h4
                className="text-lg md:text-xl lg:text-2xl font-semibold mb-3"
                style={{ fontFamily: "Palatino Linotype, sans-seriff" }}
              >
                Ranked #1 Careers & Office creator
              </h4>
              <p className="text-sm md:text-base leading-relaxed text-[#c5c5c5] max-w-xs">
                Recognised by Favikon as the #1 Careers & Office LinkedIn
                creator in the United Arab Emirates.
              </p>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col items-center text-center md:border-r md:border-white/20 md:px-4 lg:px-6">
              <div className="mb-6 flex h-[100px] w-full max-w-[120px] items-center justify-center">
                <Image
                  src="/home/advisor-trust/linkedin-logo.avif"
                  alt="Favikon Logo"
                  width={100}
                  height={100}
                  className="h-full w-auto object-contain"
                  unoptimized
                />
              </div>
              <h4
                className="text-lg md:text-xl lg:text-2xl font-semibold mb-3"
                style={{ fontFamily: "Palatino Linotype, sans-seriff" }}
              >
                Global Leadership in Content
              </h4>
              <p className="text-sm md:text-base leading-relaxed text-[#c5c5c5] max-w-xs">
                Ranked Number 1 worldwide on LinkedIn in the Careers & Office
                category.
              </p>
            </div>

            {/* Item 4 */}
            <div className="flex flex-col items-center text-center md:px-4 lg:px-6">
              <div className="mb-6 flex h-[100px] w-full max-w-[120px] items-center justify-center">
                <Image
                  src="/home/advisor-trust/uae-lens.avif"
                  alt="UAE Lens Logo"
                  width={100}
                  height={100}
                  className="h-full w-auto object-contain"
                  unoptimized
                />
              </div>
              <h4
                className="text-lg md:text-xl lg:text-2xl font-semibold mb-3"
                style={{ fontFamily: "Palatino Linotype, sans-seriff" }}
              >
                Talent & Career Advocate
              </h4>
              <p className="text-sm md:text-base leading-relaxed text-[#c5c5c5] max-w-xs">
                11+ years leading recruitment across US, Europe, Middle East &
                UK.
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
