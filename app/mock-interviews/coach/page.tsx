import { redirect } from "next/navigation";
// import type { Metadata } from "next";
// import HumanInterviewBookingForm from "./human-booking-form";

// export const metadata: Metadata = {
//   title: "Book Human Interview | JB Recruitment Solutions",
//   description: "Book a human-led mock interview using the in-app booking and payment flow.",
// };

// export const dynamic = "force-dynamic";

/**
 * Human interview booking is currently unavailable.
 * Redirect anyone who visits this URL back to the home page.
 */
export default function CoachInterviewPage() {
  // return (
  //   <div className="min-h-screen bg-[#f4f6fb]" style={{ fontFamily: "Raleway, sans-serif" }}>
  //     <div className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:pt-36 md:px-6 md:pt-24 md:pb-24">
  //       <div className="mb-6 flex items-center justify-between gap-3">
  //         <div>
  //           <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5a58ab]">
  //             Human Interview
  //           </p>
  //           <h1 className="text-2xl font-bold text-[#252e3d]">Book a human-led mock interview</h1>
  //           <p className="mt-1 text-sm text-slate-500">
  //             Share the role details, pay securely, then choose your slot inside the app.
  //           </p>
  //         </div>
  //       </div>

  //       <HumanInterviewBookingForm />
  //     </div>
  //   </div>
  // );
  redirect("/");
}
