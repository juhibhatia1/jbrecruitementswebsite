"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// ─── Inline alert popup ───────────────────────────────────────────────────────
function InlineAlert({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm animate-fadeIn"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      {/* Warning icon */}
      <svg
        className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="ml-auto shrink-0 text-red-400 hover:text-red-600 transition-colors"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  );
}

// ─── Required asterisk ────────────────────────────────────────────────────────
function Req() {
  return <span className="text-[#282828] font-bold text-lg">*</span>;
}

// ─── Main form ────────────────────────────────────────────────────────────────
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
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

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
      setAlertMessage("Please upload your resume before submitting.");
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
      className="w-full mx-auto pt-0 lg:pt-5"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      {/* Custom alert popup */}
      {alertMessage && (
        <div className="mb-4">
          <InlineAlert
            message={alertMessage}
            onClose={() => setAlertMessage(null)}
          />
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Upload Resume */}
        <div>
          <label className="block text-sm font-medium text-[#282828] mb-2">
            Upload resume <Req />
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
            Name <Req />
          </label>
          <input
            type="text"
            placeholder="jane"
            value={formData.name}
            onChange={handleChange}
            name="name"
            required
            className="w-full rounded-lg bg-[#eeeff1] border-none px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#282828] placeholder-[#979797] text-[#282828]"
          />
        </div>

        {/* Mail id */}
        <div>
          <label className="block text-sm font-medium text-[#282828] mb-2">
            Mail id <Req />
          </label>
          <input
            type="email"
            placeholder="jane@gmail.com"
            value={formData.email}
            onChange={handleChange}
            name="email"
            required
            className="w-full rounded-lg bg-[#eeeff1] border-none px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#282828] placeholder-[#979797] text-[#282828]"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-[#282828] mb-2">
            Location <Req />
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              name="location"
              required
              className="w-full rounded-lg bg-[#eeeff1] border-none px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#282828] placeholder-[#979797] text-[#282828]"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-[#282828] mb-2">
            Phone Number <Req />
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              name="phone"
              required
              className="w-full rounded-lg bg-[#eeeff1] border-none px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#282828] placeholder-[#979797] text-[#282828]"
            />
          </div>
        </div>

        {/* Description (optional) */}
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
