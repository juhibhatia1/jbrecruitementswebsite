import type { Metadata } from "next";
import { personalBrandingMetadata } from "../lib/metadata";

export const metadata: Metadata = personalBrandingMetadata;

export default function PersonalBrandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
