"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { InterviewReferenceCard } from "@/lib/interview/types";
import type { TimelineItem } from "./timeline-utils";

export { buildTimeline } from "./timeline-utils";

function ReferenceCardBlock({ card }: { card: InterviewReferenceCard }) {
  return (
    <div className="my-3 rounded-xl border border-[#5a58ab]/20 bg-[#f8f7ff] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#5a58ab]/8 border-b border-[#5a58ab]/15">
        <svg className="w-3.5 h-3.5 text-[#5a58ab] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-xs font-semibold text-[#5a58ab]">{card.title}</span>
        <span className="ml-auto text-[10px] text-[#5a58ab]/60 font-medium">Reference Card</span>
      </div>
      <div className="px-3 pb-3 pt-2 text-xs text-slate-700
        [&_h1]:text-sm [&_h1]:font-bold [&_h1]:text-[#252e3d] [&_h1]:mt-3 [&_h1]:mb-1
        [&_h2]:text-xs [&_h2]:font-bold [&_h2]:text-[#252e3d] [&_h2]:mt-2 [&_h2]:mb-1
        [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-[#5a58ab] [&_h3]:mt-2 [&_h3]:mb-0.5
        [&_strong]:font-semibold [&_strong]:text-[#252e3d]
        [&_em]:italic [&_em]:text-slate-500
        [&_blockquote]:border-l-2 [&_blockquote]:border-[#5a58ab]/40 [&_blockquote]:pl-3 [&_blockquote]:text-slate-500 [&_blockquote]:italic [&_blockquote]:my-1
        [&_hr]:border-[#5a58ab]/20 [&_hr]:my-2
        [&_pre]:bg-slate-900 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-slate-200 [&_pre]:my-1
        [&_code]:font-mono [&_code]:text-[#5a58ab] [&_code]:text-xs [&_code]:bg-[#5a58ab]/8 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5
        [&_pre_code]:text-slate-200 [&_pre_code]:bg-transparent [&_pre_code]:p-0
        [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_table]:my-1
        [&_th]:border [&_th]:border-[#5a58ab]/25 [&_th]:bg-[#5a58ab]/8 [&_th]:px-2 [&_th]:py-1 [&_th]:text-[#5a58ab] [&_th]:font-semibold [&_th]:text-left
        [&_td]:border [&_td]:border-slate-200 [&_td]:px-2 [&_td]:py-1 [&_td]:text-slate-600
        [&_p]:mt-1 [&_p]:mb-1 [&_ul]:pl-4 [&_ul]:list-disc [&_ol]:pl-4 [&_ol]:list-decimal [&_li]:my-0.5 [&_a]:text-[#5a58ab] [&_a]:underline">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{card.content}</ReactMarkdown>
      </div>
    </div>
  );
}

interface TranscriptTimelineProps {
  items: TimelineItem[];
}

export function TranscriptTimeline({ items }: TranscriptTimelineProps) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        if (item.kind === "card") {
          return <ReferenceCardBlock key={`card-${item.card.id}-${i}`} card={item.card} />;
        }
        const entry = item.entry;
        return (
          <div key={i} className={`flex gap-2.5 ${entry.role === "interviewer" ? "" : "flex-row-reverse"}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${entry.role === "interviewer" ? "bg-[#5a58ab]" : "bg-slate-200"}`}>
              <span className="text-[9px] font-bold text-white">{entry.role === "interviewer" ? "AI" : "C"}</span>
            </div>
            <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${entry.role === "interviewer" ? "bg-[#f0efff] text-[#252e3d]" : "bg-slate-100 text-slate-700"}`}>
              {entry.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
