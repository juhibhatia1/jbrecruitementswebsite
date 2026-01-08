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
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-24">
        {/* Eyebrow */}
        <div className="mb-6 flex justify-center">
          <span className="mb-3 flex items-center gap-2 text-[#605dba] text-base md:text-lg font-medium">
            <PiPlugsConnectedBold size={24} />
            Thoughtful
          </span>
        </div>

        {/* Heading */}
        <ScrollAnimation variant="fadeUp">
          <h2 className="mx-auto text-center text-white text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-semibold leading-tight">
            Guidance you can trust at every stage of
            <br />
            hiring.
          </h2>
        </ScrollAnimation>

        {/* Content */}
        <div className="mt-12 md:mt-20 lg:mt-24 grid grid-cols-1 gap-8 md:gap-12 lg:gap-16 lg:grid-cols-12 lg:items-center">
          {/* Image */}
          <ScrollAnimation
            variant="scaleUp"
            delay={0.2}
            className="lg:col-span-5"
          >
            <div className="overflow-hidden rounded-3xl">
              <Image
                src="/advisor-trust/juhi-bhatia.png"
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
            <h3 className="max-w-xl text-xl md:text-2xl lg:text-4xl font-medium leading-[1.35]">
              Hiring Is About People, Not Just Roles. Get Alignment Right, And
              Everything Else Follows.
            </h3>

            {/* Name + CTA */}
            <div className="mt-8 flex items-center gap-4 text-3xl text-[#c5c5c5]">
              <span>Juhi Bhatia</span>
              <button className="rounded-full bg-radial-[at_50%_75%] from-[#5a58ab] to-[#5d8aba] px-4 py-1.5 text-sm font-medium text-white">
                Speak
              </button>
            </div>

            {/* Divider */}
            <div className="mt-8 h-px w-full bg-white" />

            {/* Metrics */}
            <div className="mt-6 flex flex-wrap gap-8 md:gap-12 lg:gap-16 text-[#7b7b7b]">
              <div className="flex items-baseline gap-2 md:gap-3">
                <span className="text-2xl md:text-3xl font-semibold text-white">
                  84%
                </span>
                <span className="text-md text-[#c5c5c5]">
                  Better role alignment
                </span>
              </div>

              <div className="flex items-baseline gap-2 md:gap-3 text-[#7b7b7b]">
                <span className="text-2xl md:text-3xl font-semibold text-white">
                  5X
                </span>
                <span className="text-md text-[#c5c5c5]">
                  Honest communication
                </span>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>

      {/* ===== BOTTOM: INDUSTRY RECOGNITION ===== */}
      <div className="pb-16 md:pb-24 lg:pb-16">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:py-12">
          <ScrollAnimation
            variant="fadeUp"
            delay={0.4}
            className="grid grid-cols-1 gap-8 md:gap-12 lg:gap-16 md:grid-cols-3"
          >
            {/* Item 1 */}
            <div className="text-center md:border-r md:border-white md:pr-8 lg:pr-12">
              <div className="mx-auto mb-6 flex h-16 w-32 items-center justify-center">
                <Image
                  src={"/advisor-trust/arab-icons-logo.png"}
                  alt="Arab Icons Logo"
                  width={96}
                  height={96}
                />
              </div>
              <h4
                className="text-base md:text-lg lg:text-2xl font-semibold"
                style={{ fontFamily: "Palatino Linotype, sans-seriff" }}
              >
                Industry Recognition
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-[#7b7b7b] lg:text-lg">
                Featured by The Arab Icons for leadership and impact in global
                talent acquisition.
              </p>
            </div>

            {/* Item 2 */}
            <div className="text-center md:border-r md:border-white md:px-8 lg:px-12">
              <div className="mx-auto mb-6 flex h-16 w-32 items-center justify-center">
                <Image
                src={"/advisor-trust/favikon-logo.png"}
                alt="Favikon Logo"
                width={96}
                height={96}
                className="w-full "
              />
              </div>
              <h4
                className="text-lg lg:text-2xl font-semibold"
                style={{ fontFamily: "Palatino Linotype, sans-seriff" }}
              >
                Ranked #1 Careers & Office creator
              </h4>
              <p className="mt-3 text-sm lg:text-lg leading-relaxed text-[#7b7b7b]">
                Recognised by Favikon as the #1 Careers & Office LinkedIn
                creator in the United Arab Emirates.
              </p>
            </div>

            {/* Item 3 */}
            <div className="text-center md:pl-8 lg:pl-12">
              <div className="mx-auto mb-6 flex h-16 w-32 items-center justify-center">
                <Image
                src={"/advisor-trust/favikon-logo.png"}
                alt="Favikon Logo"
                width={96}
                height={96}
                className="w-full "
              />
              </div>
              <div className="mb-3 flex justify-center gap-1 text-white text-xl font-semibold">
                Global Leadership inContent
              </div>
              <p className="text-sm lg:text-lg leading-relaxed text-[#7b7b7b]">
                Ranked Number 1 worldwide on LinkedIn in the Careers & Office category.
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
