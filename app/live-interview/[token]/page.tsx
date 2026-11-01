import type { Metadata } from "next";
import RoomLoader from "./room-loader";

export const metadata: Metadata = {
  title: "Live Interview | JB Recruitment Solutions",
  robots: { index: false },
};

type Props = { params: Promise<{ token: string }> };

export default async function LiveInterviewPage({ params }: Props) {
  const { token: rawToken } = await params;
  const token = decodeURIComponent(rawToken || "").trim();
  return <RoomLoader token={token} />;
}
