"use client";

import { useState, useRef } from "react";
import { AiOutlineMessage } from "react-icons/ai";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

const testimonials = [
  {
    id: 1,
    name: "Delicia Pillay",
    role: "Head of Resourcing Sub-Saharan Africa",
    // company: "TechFlow Inc",
    image: "/home/testimonials/delicia-pillay.jpg",
    text: "Juhi is a pleasure to work with. She has a strong work ethic that shows every day in her work. Juhi takes direction quickly and runs with tasks. She was responsible for end to end recruitment in the MENA region at British Council during the time I was her Line Manager. She is a responsible and trust worthy person, these qualities are essential to make a success in the workplace. Juhi's strengths also lie in stakeholder and candidate engagement. Her calm demeanour goes a long way when working with others.",
    rating: 5,
  },
  {
    id: 2,
    name: "Mohammed Barakat",
    role: "Human Resources Director Assoc",
    // company: "StartupHub",
    image: "/home/testimonials/mohammed-barakat.jpg",
    text: "I had the pleasure of working with Juhi as part of my team, where she led the talent acquisition department with professionalism and insight. Juhi demonstrated a deep understanding of recruitment strategies and candidate engagement, consistently attracting high-quality talent in a competitive market.What stood out most was her ability to quickly grasp the nature of our business and culture, ensuring not only strong technical matches but also cultural alignment. Juhi brought structure, clarity, and energy to our hiring process and collaborated seamlessly with stakeholders across departments.I wouldn’t hesitate to work with Juhi again and can confidently recommend her to any organization looking for a committed talent acquisition Manager.",
    rating: 5,
  },
  {
    id: 3,
    name: "Shridhar Iyer",
    role: "Director of Finance at Unity",
    // company: "CloudNine Systems",
    image: "/home/testimonials/shridhar-iyer.jpg",
    text: "Juhi is one of the best recruiters I have ever worked with. She helped me complete hiring almost a dozen professionals for an upcoming project within tight timelines. Juhi was a delight to partner with - understanding our requirements & urgency, keeping the momentum, juggling multiple interview schedules, open for ideas, willing to seek help and ensuring we diversify our talent. She was brave to speak her mind, challenge our views but accommodate business constraints as we went thru the process. The pressure was immense but her happy demeanor was the perfect antidote. I’m sure she will make a meaningful impact in all her roles. Best wishes to her for a successful career.",
    rating: 5,
  },
  {
    id: 4,
    name: "Smitha Dasan",
    role: "Excellence in Hiring Quality and Exceptional Candidate Experience",
    company: "NexGen Labs",
    image: "/home/testimonials/smitha-dasan.jpg",
    text: "Juhi is a dedicated, self-motivated and a smart recruiter; totally committed to the work assigned. She is a very methodical and organised recruiter which makes the recruitment so much easy.Juhi has been working for the Shared Services group and had performed really well; understands the talent market and work closely with the stakeholders to hire the top talent.I have relied on her for critical/niche roles and and she has always proved herself with quality results. The hiring focus is on quality and diversity, Juhi is able to plan her work accordingly and drive the results in stipulated time period.Definitely an asset to any organisation she represents and I highly recommend her. I would like to wish Juhi all the best for her future endeavours.",
    rating: 5,
  },
  {
    id: 5,
    name: "Nick Macleay",
    role: "Omnia Solutions Ltd",
    // company: "InnovateCo",
    image: "/home/testimonials/omnia.webp",
    text: "Juhi, has helped me on a couple of recruitment assignments, they were not easy sourcing positions, and roles that she has not worked on before. Juhi was very quick, she listens to what we needed and delivered me a short list within 48 hrs and the 2 of the candidates that she short listed made 2nd and final stage interviews. I will definitely use Juhi again for my sourcing projects.",
    rating: 5,
  },
  {
    id: 6,
    name: "Envision People",
    role: "Recruitment Director",
    // company: "DataSphere",
    image: "/home/testimonials/envision-people.jpg",
    text: "Juhi has been supporting my recruitment drives for the last 6 months. She has worked on sourcing and first level screening of candidates. I have found Juhi to be highly proactive and has a great level of understanding the roles with basic information. I would highly recommend Juhi as a recruiter or resourcer for any roles in the UK or Europe regions.",
    rating: 5,
  },
  {
    id: 7,
    name: "Juliana Pagliaro",
    role: "Co-founder & Chief of People",
    // company: "NextGen Solutions",
    image: "/home/testimonials/juliana-pagliaro.png",
    text: "Juhi is a pleasure to work with. She has a strong work ethic that shows every day in her work. Juhi takes direction quickly and runs with tasks. She was responsible for end to end recruitment in the MENA region at British Council during the time I was her Line Manager. She is a responsible and trust worthy person, these qualities are essential to make a success in the workplace. Juhi's strengths also lie in stakeholder and candidate engagement. Her calm demeanour goes a long way when working with others.",
    rating: 5,
  },
];

export default function Testimonials() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrevious = () => {
    setActiveTestimonial((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setActiveTestimonial((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  // Handle touch events for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swipe left
      handleNext();
    }

    if (touchStart - touchEnd < -75) {
      // Swipe right
      handlePrevious();
    }
  };

  return (
    <section
      className="bg-gradient-to-br from-gray-50 to-white py-12 md:py-16 overflow-x-hidden"
      style={{ fontFamily: "Geist, sans-serif" }}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 overflow-hidden">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="mb-4 flex items-center justify-center gap-2 text-[#605dba] text-base md:text-lg font-medium">
            <AiOutlineMessage size={24} className="text-[#605dba]" />
            <span>Testimonials</span>
          </div>

          <h2
            className="text-[#252E3D] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-6"
            style={{ fontFamily: "Palatino Linotype, serif" }}
          >
            What our customers love about us
          </h2>

          {/* Avatar Row */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-8 md:mb-12 overflow-x-auto scrollbar-hide px-4 py-2">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.id}
                type="button"
                onClick={() => setActiveTestimonial(index)}
                aria-pressed={activeTestimonial === index}
                aria-label={`Show testimonial from ${testimonial.name}`}
                className={`relative rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer focus-visible:ring-[#605dba] flex-shrink-0 ${
                  activeTestimonial === index
                    ? "w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 ring-2 ring-[#605dba] ring-offset-2 scale-110 z-10"
                    : "w-10 h-10 sm:w-12 sm:h-12 hover:scale-110 hover:ring-2 hover:ring-gray-300"
                }`}
              >
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-full h-full rounded-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Main Testimonial Card */}
        <div className="relative w-full md:max-w-4xl mx-auto">
          {/* Desktop Navigation Arrows */}
          <button
            onClick={handlePrevious}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 lg:-translate-x-20 w-12 h-12 bg-white rounded-lg shadow-lg border border-gray-200 items-center justify-center hover:bg-gray-50 transition-all duration-100 hover:scale-105 z-10 cursor-pointer"
            aria-label="Previous testimonial"
          >
            <FaArrowLeft size={20} className="text-black" />
          </button>

          <button
            onClick={handleNext}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 lg:translate-x-20 w-12 h-12 bg-white rounded-lg shadow-lg border border-gray-200 items-center justify-center hover:bg-gray-50 transition-all duration-100 hover:scale-105 z-10 cursor-pointer"
            aria-label="Next testimonial"
          >
            <FaArrowRight size={20} className="text-black" />
          </button>

          {/* Testimonial Card with Touch Support */}
          <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative bg-white rounded-3xl shadow-xl p-4 sm:p-8 md:p-12 transition-all duration-500 border border-gray-200"
          >
            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-6 h-6 animate-[pulse_2s_ease-in-out_infinite]"
                  style={{ animationDelay: `${i * 0.1}s` }}
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <defs>
                    <radialGradient
                      id={`starGrad-${i}`}
                      cx="50%"
                      cy="75%"
                      r="75%"
                    >
                      <stop offset="0%" stopColor="#5a58ab" />
                      <stop offset="100%" stopColor="#5d8aba" />
                    </radialGradient>
                  </defs>
                  <path
                    fill={`url(#starGrad-${i})`}
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              ))}
            </div>

            {/* Testimonial Text */}
            <p className="text-center text-base sm:text-lg md:text-xl text-[#333333] leading-relaxed mb-8 transition-all duration-500">
              {testimonials[activeTestimonial].text}
            </p>

            {/* Author Info */}
            <div className="text-center">
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#333333] mb-1">
                {testimonials[activeTestimonial].name}
              </p>
              <p className="text-sm sm:text-base md:text-lg text-[#737373]">
                {testimonials[activeTestimonial].role}
              </p>
            </div>

            {/* Mobile Navigation Arrows */}
            <div className="md:hidden flex items-center justify-center gap-4 mt-8">
              <button
                onClick={handlePrevious}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center bg-gray-200 transition-all duration-100 hover:scale-105"
                aria-label="Previous testimonial"
              >
                <FaArrowLeft size={16} className="text-black" />
              </button>

              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      activeTestimonial === index
                        ? "w-8 bg-[#605dba]"
                        : "w-2 bg-gray-300"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center bg-gray-200 transition-all duration-100 hover:scale-105"
                aria-label="Next testimonial"
              >
                <FaArrowRight size={16} className="text-black" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
