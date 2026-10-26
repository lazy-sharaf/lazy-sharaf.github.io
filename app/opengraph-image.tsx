import { ImageResponse } from "next/og";
import { site } from "@/lib/content";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0b",
          padding: "64px 72px",
          color: "#e8e4dc",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            fontSize: 20,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(232,228,220,0.45)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ color: "rgba(232,228,220,0.9)" }}>{site.handle}</span>
            <span style={{ fontSize: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 99,
                  background: "#ff6b2c",
                }}
              />
              Open to engagements
            </span>
          </div>
          <span style={{ fontSize: 16 }}>{site.location}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 118,
              lineHeight: 0.9,
              letterSpacing: "-0.05em",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            <div>Mahbubur</div>
            <div>Rahman Soraf</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid rgba(232,228,220,0.14)",
            paddingTop: 28,
          }}
        >
          <span style={{ fontSize: 34, color: "#ff6b2c", letterSpacing: "-0.02em" }}>
            Boring recon wins.
          </span>
          <span
            style={{
              fontSize: 17,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(232,228,220,0.4)",
            }}
          >
            responsible disclosure · security research
          </span>
        </div>
      </div>
    ),
    size,
  );
}
