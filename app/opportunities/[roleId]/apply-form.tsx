"use client";

import { useState } from "react";

type Props = { templateId: string; jobRole: string };

export default function ApplyForm({ templateId, jobRole }: Props) {
  const [form, setForm] = useState({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    linkedInUrl: "",
    interviewPreference: "" as "AI" | "MANUAL" | "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!form.interviewPreference) {
      setError("Please select an interview preference.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/interviews/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, ...form }),
      });

      const data = (await res.json()) as { message?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setResult({ success: true, message: data.message ?? "Application submitted!" });
        setForm({
          candidateName: "",
          candidateEmail: "",
          candidatePhone: "",
          linkedInUrl: "",
          interviewPreference: "",
        });
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result?.success) {
    return (
      <div
        className="rounded-2xl border border-[#e0e0e0] bg-white p-6 text-center"
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        <div className="mb-3 text-3xl">✓</div>
        <h3
          className="text-lg font-semibold text-[#252e3d] mb-2"
          style={{ fontFamily: "Crimson Text, serif" }}
        >
          Booking Confirmed
        </h3>
        <p className="text-sm text-gray-600">{result.message}</p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-2.5 text-sm text-[#252e3d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5a58ab]/40 focus:border-[#5a58ab]";

  const labelClass = "block text-xs font-semibold text-[#252e3d] mb-1.5 uppercase tracking-wide";

  return (
    <div
      className="rounded-2xl border border-[#e0e0e0] bg-white p-6"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <h2
        className="text-xl font-semibold text-[#252e3d] mb-1"
        style={{ fontFamily: "Crimson Text, serif" }}
      >
        Book Mock Interview: {jobRole}
      </h2>
      <p className="text-xs text-gray-500 mb-5">
        All fields marked * are required.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="candidateName">
            Full Name *
          </label>
          <input
            id="candidateName"
            name="candidateName"
            type="text"
            required
            value={form.candidateName}
            onChange={handleChange}
            placeholder="Jane Smith"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="candidateEmail">
            Email Address *
          </label>
          <input
            id="candidateEmail"
            name="candidateEmail"
            type="email"
            required
            value={form.candidateEmail}
            onChange={handleChange}
            placeholder="jane@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="candidatePhone">
            Phone Number
          </label>
          <input
            id="candidatePhone"
            name="candidatePhone"
            type="tel"
            value={form.candidatePhone}
            onChange={handleChange}
            placeholder="+1 555 000 0000"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="linkedInUrl">
            LinkedIn URL
          </label>
          <input
            id="linkedInUrl"
            name="linkedInUrl"
            type="url"
            value={form.linkedInUrl}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/..."
            className={inputClass}
          />
        </div>

        <div>
          <p className={labelClass}>Interview Preference *</p>
          <div className="grid grid-cols-2 gap-3">
            {(["AI", "MANUAL"] as const).map((pref) => (
              <label
                key={pref}
                className={`flex cursor-pointer flex-col rounded-xl border-2 p-3 transition ${
                  form.interviewPreference === pref
                    ? "border-[#5a58ab] bg-[#f0efff]"
                    : "border-[#e0e0e0] bg-[#fafafa] hover:border-[#5a58ab]/40"
                }`}
              >
                <input
                  type="radio"
                  name="interviewPreference"
                  value={pref}
                  checked={form.interviewPreference === pref}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="text-sm font-semibold text-[#252e3d]">
                  {pref === "AI" ? "AI Mock Interview" : "Coach Session"}
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  {pref === "AI"
                    ? "Start via voice link sent to email"
                    : "Coach schedules a session"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#252e3d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2d3645] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Booking…" : "Book Session"}
        </button>
      </form>
    </div>
  );
}
