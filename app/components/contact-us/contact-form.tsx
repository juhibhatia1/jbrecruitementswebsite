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

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      console.log("Submitting form data:", formData);
      const response = await axios.post("/api/contact", formData);
      console.log("Form submitted successfully:", response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-8 w-full mx-auto border border-[#bababa]"
      style={{ fontFamily: "Geist, sans-seriff" }}
    >
      <h2 className="text-2xl lg:text-5xl font-semibold text-[#252E3D]">
        Get in Touch with Us
      </h2>

      <p
        className="text-[#252e3d] text-sm lg:text-lg mt-2"
        style={{ fontFamily: "Palatino Linotype, sans-seriff" }}
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
            <label className="text-sm text-[#242424] font-semibold">Company</label>
            <input
              type="text"
              placeholder="Nexilo"
              className="mt-1 w-full rounded-lg bg-[#f7f7f7] border border-gray-200 px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#605DBA] placeholder-[#979797] text-[#252e3d]"
            />
          </div>
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[#242424] font-semibold">Email</label>
            <input
              type="email"
              placeholder="jane@framer.com"
              value={formData.email}
              onChange={handleChange}
              name="email"
              className="mt-1 w-full rounded-lg bg-[#f7f7f7] border border-gray-200 px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#605DBA] placeholder-[#979797] text-[#252e3d]"
            />
          </div>

          <div>
            <label className="text-sm text-[#242424] font-semibold">Phone Number</label>
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
          <label className="text-sm text-[#242424] font-semibold">Messages</label>
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
          className="w-full mt-4 rounded-full bg-gradient-to-r from-[#1f2937] to-[#252E3D] py-3 text-white font-medium hover:opacity-90 transition cursor-pointer"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
