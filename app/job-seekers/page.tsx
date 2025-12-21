"use client";

import Footer from "../components/footer";
import JobSeekersForm from "../components/job-seekers-form";
import FloatingNavbar from "../components/floating-navbar";

export default function JobSeekersPage() {
  return (
    <div className="min-h-screen bg-[#F9F9FB] text-[#252E3D]" style={{ fontFamily: "Geist, sans-seriff" }}>
      <FloatingNavbar />
      
      <main className="flex-grow">
        <div className="relative mx-auto max-w-7xl px-6 md:px-6 py-24 md:py-32 flex items-center">
          
          {/* Sun Rays Background Effect */}
          <div 
            className="absolute top-0 left-0 w-full h-[600px] pointer-events-none overflow-hidden -z-10"
            style={{ opacity: 0.6 }}
          >
               <div 
              className="absolute -top-[50%] -left-[10%] w-[150%] h-[200%] bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-[-45deg] blur-3xl transform origin-top-left"
              style={{
                  background: "conic-gradient(from 180deg at 50% 50%, rgba(255,255,255,0) 0deg, rgba(0,0,0,0.03) 25deg, rgba(255,255,255,0) 40deg, rgba(0,0,0,0.04) 65deg, rgba(255,255,255,0) 90deg)"
              }}
            />
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Content */}
            <div className="pt-0 lg:pt-10">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-[#252e3d]">
                Career <br />
                Insights & <br />
                Guidance
              </h1>
              
              <p className="mt-8 text-lg md:text-xl text-[#252e3d] leading-relaxed" style={{ fontFamily: "Palatino Linotype, sans-seriff" }}>
                Explore practical career advice, industry insights, and hiring
                perspectives to help you make informed career decisions and move
                forward with confidence.
              </p>
            </div>

            {/* Right Content: Form */}
            <div className="w-full">
              <JobSeekersForm />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
