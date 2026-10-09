"use client";

import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaLinkedin, FaCheckCircle } from "react-icons/fa";
import { toast } from "sonner";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage?: "3-month" | "6-month" | "general";
}

export default function InquiryModal({
  isOpen,
  onClose,
  selectedPackage = "general",
}: InquiryModalProps) {
  const [packageName, setPackageName] = useState<string>(
    selectedPackage === "3-month"
      ? "3-Month Package ($3,000 USD)"
      : selectedPackage === "6-month"
      ? "6-Month Package ($5,000 USD)"
      : "General Inquiry"
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Update package when modal opens or selectedPackage prop changes
  React.useEffect(() => {
    if (selectedPackage === "3-month") {
      setPackageName("3-Month Package ($3,000 USD)");
    } else if (selectedPackage === "6-month") {
      setPackageName("6-Month Package ($5,000 USD)");
    } else {
      setPackageName("General Inquiry");
    }
    setSubmitted(false);
  }, [selectedPackage, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error("Please fill in your name and email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          phone: "Not provided",
          message: `[LinkedIn Personal Branding Inquiry - ${packageName}]\nRole: ${currentRole}\nLinkedIn: ${linkedInUrl}\n\nNotes: ${message}`,
          service: "LinkedIn Personal Branding",
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success("Thank you! Juhi and the team will get in touch with you shortly.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        {/* Header Band */}
        <div className="bg-[#1a1f2b] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            aria-label="Close modal"
          >
            <IoClose className="text-2xl" />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5a58ab]/30 border border-[#5a58ab]/40 text-xs font-semibold text-[#a5a3ff] mb-2">
            <span>✨ Fully Managed Service</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
            Build Your Personal Brand
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Connect directly with Juhi Bhatia &amp; the team to coordinate your onboarding.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[78vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                <FaCheckCircle />
              </div>
              <h4 className="text-xl font-bold text-[#252e3d]">Inquiry Received!</h4>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Thank you, <strong>{fullName}</strong>. We have received your inquiry for the{" "}
                <strong>{packageName}</strong>. Juhi and our team will review your profile and reach out within 24 hours.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-5 rounded-xl bg-[#252E3D] hover:bg-[#1a1f2b] text-white font-semibold text-sm transition-all shadow-md cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Selected Package
                  </label>
                  <select
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5a58ab] bg-gray-50/50"
                  >
                    <option value="3-Month Package ($3,000 USD)">
                      3-Month Package: LinkedIn Brand Launch ($3,000 USD)
                    </option>
                    <option value="6-Month Package ($5,000 USD)">
                      6-Month Package: LinkedIn Brand Authority ($5,000 USD)
                    </option>
                    <option value="General Inquiry">
                      Not sure yet / Want a consultation
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5a58ab]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5a58ab]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Current Role / Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Founder, CEO, VP"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5a58ab]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      LinkedIn Profile URL
                    </label>
                    <div className="relative">
                      <FaLinkedin className="absolute left-3 top-3 text-gray-400 text-sm" />
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={linkedInUrl}
                        onChange={(e) => setLinkedInUrl(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5a58ab]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Your Goal / Questions (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us what you want to achieve or any specific questions..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5a58ab]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#5a58ab] hover:bg-[#4d4a99] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
