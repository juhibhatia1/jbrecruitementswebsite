"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OPENAI_REALTIME_VOICES = ["alloy","ash","ballad","cedar","coral","echo","marin","sage","shimmer","verse"] as const;

type AdvancedConfig = {
  voiceOption: string;
  technicalCompetencies: string;
  behaviouralCompetencies: string;
  specificQuestions: string;
  evaluationCriteria: string;
  passingThreshold: string;
  languagePreference: string;
  areasToEmphasize: string;
  areasToAvoid: string;
};

type ExistingTemplate = {
  id: string;
  jobRole: string;
  experienceLevel: string;
  techStack: string[];
  requiredSkills: string[];
  durationMinutes: number;
  difficultyLevel: string;
  advancedConfig: Record<string, string> | null;
  interviewDescription: string | null;
  systemInstructions: string | null;
  isActive: boolean;
};

type Props = {
  ownerRole: "ADMIN" | "EMPLOYEE";
  apiBase: string;
  redirectTo: string;
  existingTemplate?: ExistingTemplate;
};

const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior Level", "Lead / Manager", "Director+"];
const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"];

export default function TemplateForm({ apiBase, redirectTo, existingTemplate }: Props) {
  const router = useRouter();
  const isEditing = Boolean(existingTemplate);

  const [form, setForm] = useState({
    jobRole: existingTemplate?.jobRole ?? "",
    experienceLevel: existingTemplate?.experienceLevel ?? "",
    techStack: existingTemplate?.techStack.join(", ") ?? "",
    requiredSkills: existingTemplate?.requiredSkills.join(", ") ?? "",
    durationMinutes: String(existingTemplate?.durationMinutes ?? 30),
    difficultyLevel: existingTemplate?.difficultyLevel ?? "",
  });

  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(existingTemplate?.advancedConfig),
  );
  const [advanced, setAdvanced] = useState<AdvancedConfig>({
    voiceOption: existingTemplate?.advancedConfig?.voiceOption ?? "marin",
    technicalCompetencies: existingTemplate?.advancedConfig?.technicalCompetencies ?? "",
    behaviouralCompetencies: existingTemplate?.advancedConfig?.behaviouralCompetencies ?? "",
    specificQuestions: existingTemplate?.advancedConfig?.specificQuestions ?? "",
    evaluationCriteria: existingTemplate?.advancedConfig?.evaluationCriteria ?? "",
    passingThreshold: existingTemplate?.advancedConfig?.passingThreshold ?? "",
    languagePreference: existingTemplate?.advancedConfig?.languagePreference ?? "",
    areasToEmphasize: existingTemplate?.advancedConfig?.areasToEmphasize ?? "",
    areasToAvoid: existingTemplate?.advancedConfig?.areasToAvoid ?? "",
  });

  const [autoGenOnSave, setAutoGenOnSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [error, setError] = useState("");
  const [generatedDescription, setGeneratedDescription] = useState(
    existingTemplate?.interviewDescription ?? "",
  );
  const [generatedInstructions, setGeneratedInstructions] = useState(
    existingTemplate?.systemInstructions ?? "",
  );
  const [isActive, setIsActive] = useState(existingTemplate?.isActive ?? false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdvancedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAdvanced((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const buildPayload = () => ({
    jobRole: form.jobRole.trim(),
    experienceLevel: form.experienceLevel,
    techStack: form.techStack.split(",").map((s) => s.trim()).filter(Boolean),
    requiredSkills: form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
    durationMinutes: parseInt(form.durationMinutes, 10),
    difficultyLevel: form.difficultyLevel,
    advancedConfig: showAdvanced
      ? Object.fromEntries(
          Object.entries(advanced).filter(([, v]) => v.trim() !== ""),
        )
      : undefined,
  });

  const handleSave = async () => {
    setError("");
    const payload = buildPayload();
    if (!payload.jobRole || !payload.experienceLevel || !payload.difficultyLevel) {
      setError("Job Role, Experience Level, and Difficulty are required.");
      return;
    }

    setSaving(true);
    try {
      const url = isEditing ? `${apiBase}/${existingTemplate!.id}` : apiBase;
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Failed to save template.");
        return;
      }

      if (!isEditing) {
        const data = (await res.json()) as { template?: { id: string } };
        const newId = data.template?.id;
        if (newId && autoGenOnSave) {
          setAutoGenerating(true);
          try {
            await fetch(`${apiBase}/${newId}/generate`, { method: "POST" });
          } catch {
            // generation failure non-fatal — user can retry on edit page
          } finally {
            setAutoGenerating(false);
          }
        }
        router.push(newId ? `${redirectTo}/${newId}` : redirectTo);
      } else {
        if (autoGenOnSave) {
          setAutoGenerating(true);
          try {
            await fetch(`${apiBase}/${existingTemplate!.id}/generate`, { method: "POST" });
            const genRes = await fetch(`${apiBase}/${existingTemplate!.id}`);
            if (genRes.ok) {
              const genData = (await genRes.json()) as { template?: { interviewDescription?: string; systemInstructions?: string; isActive?: boolean } };
              setGeneratedDescription(genData.template?.interviewDescription ?? "");
              setGeneratedInstructions(genData.template?.systemInstructions ?? "");
              setIsActive(genData.template?.isActive ?? false);
            }
          } catch {
            // non-fatal
          } finally {
            setAutoGenerating(false);
          }
        }
        router.push(redirectTo);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!isEditing) {
      setError("Save the template first before generating AI instructions.");
      return;
    }
    setError("");
    setGenerating(true);
    try {
      const res = await fetch(`${apiBase}/${existingTemplate!.id}/generate`, {
        method: "POST",
      });

      const data = (await res.json()) as {
        template?: ExistingTemplate;
        error?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Generation failed. Please try again.");
        return;
      }

      setGeneratedDescription(data.template?.interviewDescription ?? "");
      setGeneratedInstructions(data.template?.systemInstructions ?? "");
      setIsActive(data.template?.isActive ?? false);
    } catch {
      setError("Network error during generation.");
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleActive = async () => {
    if (!isEditing) return;
    const res = await fetch(`${apiBase}/${existingTemplate!.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (res.ok) setIsActive((prev) => !prev);
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#252e3d] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5a58ab]/30 focus:border-[#5a58ab]";
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide";

  return (
    <div className="space-y-6">
      {/* Core fields */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Role Configuration</h2>

        <div>
          <label className={labelClass}>Job Role *</label>
          <input
            name="jobRole"
            value={form.jobRole}
            onChange={handleChange}
            placeholder="e.g. Senior React Developer"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Experience Level *</label>
            <select name="experienceLevel" value={form.experienceLevel} onChange={handleChange} className={inputClass}>
              <option value="">Select…</option>
              {EXPERIENCE_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Difficulty *</label>
            <select name="difficultyLevel" value={form.difficultyLevel} onChange={handleChange} className={inputClass}>
              <option value="">Select…</option>
              {DIFFICULTY_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Duration (minutes)</label>
          <input
            name="durationMinutes"
            type="number"
            min={10}
            max={120}
            value={form.durationMinutes}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Tech Stack (comma-separated)</label>
          <input
            name="techStack"
            value={form.techStack}
            onChange={handleChange}
            placeholder="React, TypeScript, Node.js"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Required Skills (comma-separated)</label>
          <input
            name="requiredSkills"
            value={form.requiredSkills}
            onChange={handleChange}
            placeholder="Problem solving, REST APIs, Git"
            className={inputClass}
          />
        </div>
      </div>

      {/* Advanced config */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          className="flex items-center justify-between w-full text-sm font-bold text-slate-700 uppercase tracking-wide"
        >
          <span>Advanced Configuration (Optional)</span>
          <span className="text-lg">{showAdvanced ? "−" : "+"}</span>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-3">
            <div>
              <label className={labelClass}>AI Interviewer Voice</label>
              <select
                name="voiceOption"
                value={advanced.voiceOption}
                onChange={(e) => setAdvanced((prev) => ({ ...prev, voiceOption: e.target.value }))}
                className={inputClass}
              >
                {OPENAI_REALTIME_VOICES.map((v) => (
                  <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}{v === "marin" ? " (Default)" : ""}</option>
                ))}
              </select>
            </div>
            {[
              {
                name: "technicalCompetencies",
                label: "Technical Competencies",
                placeholder: "e.g. System design, REST APIs, SQL query optimisation, Git branching strategies",
              },
              {
                name: "behaviouralCompetencies",
                label: "Behavioural Competencies",
                placeholder: "e.g. Communication clarity, ownership mindset, conflict resolution, adaptability under pressure",
              },
              {
                name: "specificQuestions",
                label: "Specific Questions to Include",
                placeholder: "e.g. Describe a time you debugged a critical production issue. How do you handle tight deadlines?",
              },
              {
                name: "evaluationCriteria",
                label: "Evaluation Criteria",
                placeholder: "e.g. Technical accuracy (40%), problem-solving approach (30%), communication (20%), culture fit (10%)",
              },
              {
                name: "passingThreshold",
                label: "Passing Threshold",
                placeholder: "e.g. 70% — candidates scoring below this are not shortlisted",
              },
              {
                name: "languagePreference",
                label: "Language Preference",
                placeholder: "e.g. English only, or English with Hindi allowed for explanations",
              },
              {
                name: "areasToEmphasize",
                label: "Areas to Emphasize",
                placeholder: "e.g. Cloud infrastructure experience, startup background, hands-on coding ability",
              },
              {
                name: "areasToAvoid",
                label: "Areas to Avoid",
                placeholder: "e.g. Do not ask about salary expectations, avoid overly theoretical questions",
              },
            ].map((field) => (
              <div key={field.name}>
                <label className={labelClass}>{field.label}</label>
                <input
                  name={field.name}
                  value={advanced[field.name as keyof AdvancedConfig]}
                  onChange={handleAdvancedChange}
                  placeholder={field.placeholder}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}


      {/* Auto-generate toggle */}
      <label className="flex items-center gap-2.5 cursor-pointer w-fit">
        <div
          onClick={() => setAutoGenOnSave((p) => !p)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
            autoGenOnSave ? "bg-[#5a58ab]" : "bg-slate-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
              autoGenOnSave ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </div>
        <span className="text-sm text-slate-600 select-none">
          Auto-generate AI instructions on save
        </span>
      </label>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || autoGenerating}
          className="rounded-xl bg-[#252e3d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2d3645] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {autoGenerating ? "Generating AI Instructions…" : saving ? "Saving…" : isEditing ? "Save Changes" : autoGenOnSave ? "Save & Generate" : "Create Template"}
        </button>

        {isEditing && (
          <>
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={generating}
              className="rounded-xl bg-[#5a58ab] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4a49a0] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generating ? "Generating…" : "Generate Description & AI Instructions"}
            </button>

            <button
              type="button"
              onClick={() => void handleToggleActive()}
              className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {isActive ? "Active" : "Set Active"}
            </button>
          </>
        )}
      </div>

      {/* Generation loader */}
      {(generating || autoGenerating) && (
        <div className="rounded-2xl border border-[#5a58ab]/20 bg-[#f5f4ff] p-6 flex items-start gap-4">
          <div className="shrink-0 mt-0.5">
            <div className="w-5 h-5 border-2 border-[#5a58ab] border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#3d3b8a]">Generating AI Instructions…</p>
            <p className="text-xs text-[#5a58ab]/80 mt-1 leading-relaxed">
              This usually takes 30–40 seconds. The AI is analysing the role configuration and writing a complete interview guide — please keep this page open.
            </p>
          </div>
        </div>
      )}

      {/* Generated content preview */}
      {isEditing && (generatedDescription || generatedInstructions) && !(generating || autoGenerating) && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            Generated Content
            {isActive && (
              <span className="ml-2 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs font-medium normal-case">
                Live
              </span>
            )}
          </h2>

          {generatedDescription && (
            <div>
              <p className={labelClass}>Candidate-Facing Description</p>
              <p className="text-sm text-slate-700 leading-relaxed bg-[#f9fafc] rounded-xl p-4">
                {generatedDescription}
              </p>
            </div>
          )}

          {generatedInstructions && (
            <div>
              <p className={labelClass}>AI System Instructions</p>
              <pre className="text-xs text-slate-600 leading-relaxed bg-[#f9fafc] rounded-xl p-4 whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
                {generatedInstructions}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
