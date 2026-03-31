"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function JobSeekersForm() {
  const pathname = usePathname();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    phone: "",
    description: "",
  });
  const [resume, setResume] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setResume(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resume) {
      alert("Please upload a resume.");
      return;
    }

    setStatus("loading");
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("location", formData.location);
    data.append("phone", formData.phone);
    data.append("description", formData.description);
    data.append("resume", resume);

    try {
      const response = await fetch("/api/job-seekers", {
        method: "POST",
        headers: {
          "x-pathname": pathname,
        },
        body: data,
      });

      if (!response.ok) {
        throw new Error("Job seeker submission failed");
      }

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        location: "",
        phone: "",
        description: "",
      });
      setResume(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus("error");
    }
  };

  return (
    <div
      className="w-full mx-auto pt-0 lg:pt-10"
      style={{ fontFamily: "Raleway, sans-serif" }}
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
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
            />
            <div className="w-full rounded-lg bg-[#eeeff1] border-none px-4 py-3 text-[#979797] text-sm truncate">
              {resume ? resume.name : "Upload (PDF, DOC, DOCX)"}
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
            placeholder="jane@gmail.com"
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
          disabled={status === "loading"}
          className="w-full mt-4 rounded-full bg-linear-to-r from-[#1f2937] to-[#282828] py-3 text-white font-medium hover:opacity-90 transition cursor-pointer disabled:opacity-50"
        >
          {status === "loading" ? "Submitting..." : "Submit"}
        </button>
        {status === "success" && (
          <p className="text-green-600 text-center mt-2">
            Application submitted successfully!
          </p>
        )}
        {status === "error" && (
          <p className="text-red-500 text-center mt-2">
            Failed to submit application. Please try again.
          </p>
        )}
      </form>
    </div>
  );
}
