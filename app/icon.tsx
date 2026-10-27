import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * The mark is the asterisk — the wildcard. It reads at 16px in a tab, which is
 * the only place a favicon actually gets looked at.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0b",
          color: "#ff6b2c",
          fontSize: 58,
          fontWeight: 700,
          lineHeight: 1,
          paddingBottom: 10,
        }}
      >
        *
      </div>
    ),
    size,
  );
}
