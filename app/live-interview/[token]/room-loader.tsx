"use client";

import dynamic from "next/dynamic";

const InterviewRoom = dynamic(() => import("./interview-room"), {
  ssr: false,
  loading: () => (
    <div
      className="flex min-h-screen items-center justify-center bg-[#0f1117]"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <p className="text-sm text-gray-400">Loading interview room…</p>
    </div>
  ),
});

export default function RoomLoader({ token }: { token: string }) {
  return <InterviewRoom token={token} />;
}
