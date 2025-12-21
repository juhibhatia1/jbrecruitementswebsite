"use client";
import { useState } from "react";
import axios from "axios";

export default function JobSeekersForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    phone: "",
    description: "",
  });

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      console.log("Submitting job seeker data:", formData);
      // const response = await axios.post("/api/job-seekers", formData);
      // console.log("Form submitted successfully:", response.data);
      alert("Application submitted! (Demo)");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div
      className="w-full mx-auto"
      style={{ fontFamily: "Geist, sans-seriff" }}
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Upload Resume */}
        <div>
          <label className="block text-sm font-medium text-[#282828] mb-2">
            Upload resume
          </label>
          <div className="relative">
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              name="resume"
            />
            <div className="w-full rounded-lg bg-[#eeeff1] border-none px-4 py-3 text-[#979797] text-sm">
              Upload
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-[#282828] mb-2">
            Name
          </label>
          <input
            type="text"
            placeholder="jane"
            value={formData.name}
            onChange={handleChange}
            name="name"
            className="w-full rounded-lg bg-[#eeeff1] border-none px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#282828] placeholder-[#979797] text-[#282828]"
          />
        </div>

        {/* Mail id */}
        <div>
          <label className="block text-sm font-medium text-[#282828] mb-2">
            Mail id
          </label>
          <input
            type="email"
            placeholder="jane@framer.com"
            value={formData.email}
            onChange={handleChange}
            name="email"
            className="w-full rounded-lg bg-[#eeeff1] border-none px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#282828] placeholder-[#979797] text-[#282828]"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-[#282828] mb-2">
            Location
          </label>
          <div className="relative">
            <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            name="location"
            className="w-full rounded-lg bg-[#eeeff1] border-none px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#282828] placeholder-[#979797] text-[#282828]"
          />  
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-[#282828] mb-2">
            Phone Number
          </label>
          <div className="relative">
            <input
            type="text"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            name="phone"
            className="w-full rounded-lg bg-[#eeeff1] border-none px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#282828] placeholder-[#979797] text-[#282828]"
          />  
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#282828] mb-2">
            Description
          </label>
          <textarea
            placeholder="Leave your message"
            value={formData.description}
            onChange={handleChange}
            name="description"
            rows={4}
            className="mt-1 w-full rounded-lg bg-[#eeeff1] border-none px-4 py-3 resize-none focus:outline-none focus:ring-1 focus:ring-[#282828] placeholder-[#979797] text-[#282828]"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full mt-4 rounded-full bg-gradient-to-r from-[#1f2937] to-[#282828] py-3 text-white font-medium hover:opacity-90 transition cursor-pointer"
        >
          Submit
        </button>
      </form>
    </div>
  );
}