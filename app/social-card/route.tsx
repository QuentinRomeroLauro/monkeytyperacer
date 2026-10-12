import { Logo } from "@/components/brand-logo";
import { ImageResponse } from "next/og";
export const dynamic = "force-static";
export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#323437",
        color: "#d7e0e7",
        padding: 72,
        display: "flex",
        flexDirection: "column",
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          color: "#4da8e8",
          fontSize: 28,
        }}
      >
        <Logo width="64" height="64" stroke="#4da8e8" />
        monkeytype racer
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 70,
          letterSpacing: -3,
          marginTop: 64,
          maxWidth: 950,
          lineHeight: 1.1,
        }}
      >
        A little friendly competition.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 25,
          color: "#a1aab3",
          marginTop: 32,
        }}
      >
        Same quote. Shared start. Your next great race.
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "auto",
          fontSize: 20,
          color: "#4da8e8",
        }}
      >
        monkeytyperacer.com
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
