"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

// ─── Required asterisk ────────────────────────────────────────────────────────
function Req() {
  return <span className="text-[#242424] font-bold text-lg">*</span>;
}

export default function ContactForm() {
  const pathname = usePathname();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const nameClean = formData.name.trim();
    const emailClean = formData.email.trim();
    const phoneClean = formData.phone.trim();
    const messageClean = formData.message.trim();
    const phoneDigits = phoneClean.replace(/\D/g, "");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s\-\(\)\.]{6,20}$/;

    if (!nameClean || nameClean.length < 2 || !/\p{L}/u.test(nameClean)) {
      setErrorMessage("Please enter a valid name (at least 2 letters).");
      return;
    }

    if (!emailClean || !emailRegex.test(emailClean)) {
      setErrorMessage("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    if (!phoneClean || !phoneRegex.test(phoneClean) || phoneDigits.length < 6 || phoneDigits.length > 15) {
      setErrorMessage("Please enter a valid phone number with country code (e.g. +1 555 123 4567 or +44 7911 123456).");
      return;
    }

    if (!messageClean || messageClean.length < 5) {
      setErrorMessage("Please enter a message (at least 5 characters).");
      return;
    }

    setStatus("loading");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pathname": pathname,
        },
        body: JSON.stringify({
          ...formData,
          name: nameClean,
          email: emailClean,
          phone: phoneClean,
          message: messageClean,
        }),
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resData.error || "Contact form submission failed");
      }

      setStatus("success");
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to send message. Please try again.");
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-6 sm:p-8 sm:py-6 w-full mx-auto border border-[#bababa]"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-[#252E3D]">
        Get in Touch with Us
      </h2>

      <p className="text-[#252e3d] text-sm sm:text-base lg:text-lg mt-2">
        Share your questions, thoughts, or ideas - we're here to help and ready
        to listen.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {/* Name + Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[#242424] font-semibold">
              Name <Req />
            </label>
            <input
              type="text"
              placeholder="Jane Smith"
              value={formData.name}
              minLength={2}
              className="mt-1 w-full rounded-lg bg-[#f7f7f7] border border-gray-200 px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#605DBA] placeholder-[#979797] text-[#252e3d]"
              onChange={handleChange}
              name="name"
              required
            />
          </div>

          <div>
            {/* Company is optional — no asterisk */}
            <label className="text-sm text-[#242424] font-semibold">
              Company
            </label>
            <input
              type="text"
              placeholder="Google"
              value={formData.company}
              onChange={handleChange}
              name="company"
              className="mt-1 w-full rounded-lg bg-[#f7f7f7] border border-gray-200 px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#605DBA] placeholder-[#979797] text-[#252e3d]"
            />
          </div>
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[#242424] font-semibold">
              Email <Req />
            </label>
            <input
              type="email"
              placeholder="jane@gmail.com"
              value={formData.email}
              onChange={handleChange}
              name="email"
              required
              className="mt-1 w-full rounded-lg bg-[#f7f7f7] border border-gray-200 px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#605DBA] placeholder-[#979797] text-[#252e3d]"
            />
          </div>

          <div>
            <label className="text-sm text-[#242424] font-semibold">
              Phone Number <Req />
            </label>
            <input
              type="tel"
              placeholder="+1 (777) 123-7366"
              value={formData.phone}
              onChange={handleChange}
              name="phone"
              pattern="^\+?[0-9\s\-\(\)\.]{6,20}$"
              title="Please enter a valid phone number with digits and country code (e.g. +1 555 123 4567 or +44 7911 123456)"
              required
              className="mt-1 w-full rounded-lg bg-[#f7f7f7] border border-gray-200 px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#605DBA] placeholder-[#979797] text-[#252e3d]"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="text-sm text-[#242424] font-semibold">
            Messages <Req />
          </label>
          <textarea
            placeholder="Leave your message"
            value={formData.message}
            onChange={handleChange}
            name="message"
            rows={4}
            minLength={5}
            required
            className="mt-1 w-full rounded-lg bg-[#f7f7f7] border border-gray-200 px-2 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#605DBA] placeholder-[#979797] text-[#252e3d]"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full mt-4 rounded-full bg-linear-to-r from-[#1f2937] to-[#252E3D] py-3 text-white font-medium hover:opacity-90 transition cursor-pointer disabled:opacity-50"
        >
          {status === "loading" ? "Sending..." : "Submit"}
        </button>
        {status === "success" && (
          <p className="text-green-600 text-center mt-2">
            Message sent successfully!
          </p>
        )}
        {errorMessage && (
          <p className="text-red-500 text-center mt-2 text-sm font-medium">
            {errorMessage}
          </p>
        )}
      </form>
    </div>
  );
}
