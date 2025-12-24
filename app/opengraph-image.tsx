import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "JB Recruitment Solutions - HR Consulting & Talent Acquisition";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: "linear-gradient(135deg, #252e3d 0%, #3d4a5f 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              fontSize: 140,
              fontWeight: "bold",
              letterSpacing: "-4px",
              background: "linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              textShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            JB
          </div>
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: "600",
            textAlign: "center",
            marginBottom: "20px",
            lineHeight: 1.2,
          }}
        >
          Recruitment Solutions
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: "400",
            textAlign: "center",
            opacity: 0.9,
            maxWidth: "900px",
          }}
        >
          Premier HR Consulting & Talent Acquisition
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            fontSize: 24,
            opacity: 0.7,
          }}
        >
          Connecting Talent with Opportunity
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
