import type { Metadata } from "next";
import { jobSeekersMetadata } from "../lib/metadata";

export const metadata: Metadata = jobSeekersMetadata;

export default function JobSeekersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
