"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/employee/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setStatus("error");
        setError(data.error || "Login failed. Please check your credentials.");
        return;
      }

      router.replace("/employee/directory");
      router.refresh();
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-8">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl lg:grid-cols-2">
          {/* Brand/Marketing Sidebar */}
          <div className="relative hidden bg-[#5a58ab] p-10 text-white lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_40%)]" />
            <div className="relative z-10 flex h-full flex-col items-start justify-center gap-0">
              <p className="text-sm uppercase tracking-[0.22em] text-indigo-100">
                JB Recruitment Solutions
              </p>
              <h1 className="mt-6 text-4xl font-semibold leading-tight" style={{ fontFamily: "Crimson Text, serif" }}>
                Employee Portal
              </h1>
              <p className="mt-6 text-base text-indigo-100">
                Sign in to view candidate directory, check service orders,
                track delivery deadlines, and check off completed delivery items.
              </p>
            </div>
          </div>

          {/* Form container */}
          <div className="p-8 sm:p-10 lg:p-12">
            <h2 className="text-3xl font-semibold text-[#252e3d]">
              Employee Login
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Use your employee credentials to continue.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                  <label
                    className="text-sm font-semibold text-slate-700"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[#5a58ab] focus:bg-white text-sm"
                    placeholder="Enter employee email"
                  />
              </div>

              <div>
                <label
                  className="text-sm font-semibold text-slate-700"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[#5a58ab] focus:bg-white text-sm"
                  placeholder="Enter employee password"
                />
              </div>

              {status === "error" ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 font-semibold">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-xl bg-[#252e3d] hover:bg-[#313d53] px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {status === "loading" ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
