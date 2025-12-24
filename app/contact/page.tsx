import Image from "next/image";
import ContactForm from "../components/contact-form";
import ScrollAnimation from "../components/ui/scroll-animation";
import { CiMail } from "react-icons/ci";
import { MdLocalPhone } from "react-icons/md";
import { Metadata } from "next";
import { contactMetadata } from "../lib/metadata";

export const metadata: Metadata = contactMetadata;

export default function ContactPage() {
  return (
    <div
      className="min-h-screen flex flex-col bg-white"
      style={{ fontFamily: "Geist, sans-serif" }}
    >

      <main className="flex-grow bg-white">
        <div className="mx-auto max-w-7xl px-6 md:px-6 py-24 md:py-32 flex items-center">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* LEFT CONTENT */}
            <ScrollAnimation variant="fadeUp" className="space-y-8">
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-semibold text-[#252e3d] leading-tight"
                style={{ fontFamily: "Geist, sans-serif" }}
              >
                Let’s Connect
              </h1>

              <p
                className="text-[#252e3d] leading-relaxed text-lg"
                style={{ fontFamily: "Palatino Linotype, sans-serif" }}
              >
                We’d love to hear from you. Whether you’re looking to hire,
                exploring new opportunities, or simply have a question — we’re
                here to listen and help.
              </p>

              {/* Founder */}
              <div className="flex items-center gap-4 pt-4">
                <Image
                  src="/founder.jpeg"
                  alt="Founder"
                  width={56}
                  height={56}
                  className="rounded-full object-cover"
                />
                <div>
                  <p
                    className="font-semibold text-[#252e3d] text-lg"
                    style={{ fontFamily: "Geist, sans-serif" }}
                  >
                    Juhi Bhatia
                  </p>
                  <p className="text-sm text-[#252E3D]">Founder & CEO of JB</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-6 pt-8">
                <div className="flex items-center gap-4 group">
                  <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-[#605dba]">
                    <CiMail size={24} className="text-[#605dba]" />
                  </div>
                  <span className="text-[#252e3d] text-lg font-medium">
                    juhi.bhatia1@gmail.com
                  </span>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-[#605dba]">
                    <MdLocalPhone size={24} className="text-[#605dba]" />
                  </div>
                  <span className="text-[#252e3d] text-lg font-medium">
                    +1 (555) 123-4567
                  </span>
                </div>
              </div>
            </ScrollAnimation>

            {/* RIGHT FORM */}
            <ScrollAnimation variant="slideLeft" delay={0.2}>
              <ContactForm />
            </ScrollAnimation>
          </div>
        </div>
      </main>
    </div>
  );
}
