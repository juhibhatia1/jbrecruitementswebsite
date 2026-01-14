"use client";
import { useState } from "react";
import axios from "axios";

export default function ContactForm() {
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

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    try {
      await axios.post("/api/contact", formData);
      setStatus("success");
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus("error");
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full mx-auto border border-[#bababa]"
      style={{ fontFamily: "Geist, sans-serif" }}
    >
      <h2 className="text-2xl lg:text-5xl font-semibold text-[#252E3D]">
        Get in Touch with Us
      </h2>

      <p
        className="text-[#252e3d] text-sm sm:text-base lg:text-lg mt-2"
        style={{ fontFamily: "Palatino Linotype, sans-serif" }}
      >
        Share your questions, thoughts, or ideas—we're here to help and ready to
        listen.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {/* Name + Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[#242424] font-semibold">Name</label>
            <input
              type="text"
              placeholder="Jane Smith"
              value={formData.name}
              className="mt-1 w-full rounded-lg bg-[#f7f7f7] border border-gray-200 px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#605DBA] placeholder-[#979797] text-[#252e3d]"
              onChange={handleChange}
              name="name"
            />
          </div>

          <div>
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
              Email
            </label>
            <input
              type="email"
              placeholder="jane@gmail.com"
              value={formData.email}
              onChange={handleChange}
              name="email"
              className="mt-1 w-full rounded-lg bg-[#f7f7f7] border border-gray-200 px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#605DBA] placeholder-[#979797] text-[#252e3d]"
            />
          </div>

          <div>
            <label className="text-sm text-[#242424] font-semibold">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+1 (777) 123-7366"
              value={formData.phone}
              onChange={handleChange}
              name="phone"
              className="mt-1 w-full rounded-lg bg-[#f7f7f7] border border-gray-200 px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#605DBA] placeholder-[#979797] text-[#252e3d]"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="text-sm text-[#242424] font-semibold">
            Messages
          </label>
          <textarea
            placeholder="Leave your message"
            value={formData.message}
            onChange={handleChange}
            name="message"
            rows={4}
            className="mt-1 w-full rounded-lg bg-[#f7f7f7] border border-gray-200 px-2 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#605DBA] placeholder-[#979797] text-[#252e3d]"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full mt-4 rounded-full bg-gradient-to-r from-[#1f2937] to-[#252E3D] py-3 text-white font-medium hover:opacity-90 transition cursor-pointer disabled:opacity-50"
        >
          {status === "loading" ? "Sending..." : "Submit"}
        </button>
        {status === "success" && (
          <p className="text-green-600 text-center mt-2">
            Message sent successfully!
          </p>
        )}
        {status === "error" && (
          <p className="text-red-500 text-center mt-2">
            Failed to send message. Please try again.
          </p>
        )}
      </form>
    </div>
  );
}
