import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "JB Recruitment Solutions - HR Consulting & Talent Acquisition";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jbrecruitment.com";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 60,
        background: "linear-gradient(135deg, #252e3d 0%, #3d4a5f 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "system-ui, sans-serif",
        padding: "80px",
        position: "relative",
      }}
    >
      <img
        src={`${baseUrl}/logo.avif`}
        alt="JB Recruitment Solutions logo"
        style={{
          width: 180,
          height: 180,
          objectFit: "contain",
          marginBottom: 32,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 32,
          padding: 24,
        }}
      />
      <div
        style={{
          fontSize: 52,
          fontWeight: 700,
          textAlign: "center",
          marginBottom: 18,
          lineHeight: 1.2,
          letterSpacing: "-0.5px",
        }}
      >
        JB Recruitment Solutions
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 400,
          textAlign: "center",
          opacity: 0.92,
          maxWidth: 860,
          lineHeight: 1.35,
        }}
      >
        Premier HR consulting, talent acquisition, and executive search
        connecting exceptional talent with ambitious organisations.
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 52,
          fontSize: 24,
          opacity: 0.75,
        }}
      >
        Connecting Talent with Opportunity
      </div>
    </div>,
    {
      ...size,
    },
  );
}
