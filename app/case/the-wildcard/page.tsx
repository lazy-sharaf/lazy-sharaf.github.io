import Link from "next/link";

const TARGET = "/writeup/how-i-hacked-a-live-chatbot/";

// Static export ignores next.config redirects, so the old URL gets a real
// page with a meta refresh and a visible fallback link.
export default function WildcardRedirect() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background: "#141416",
        color: "#e8e4dc",
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        textAlign: "center",
      }}
    >
      <meta httpEquiv="refresh" content={`0; url=${TARGET}`} />
      <div>
        <p style={{ opacity: 0.7, fontSize: "0.8rem", letterSpacing: "0.08em" }}>
          This writeup moved.
        </p>
        <p style={{ marginTop: "1rem" }}>
          <Link href={TARGET} style={{ color: "#ff6b2c" }}>
            Continue to “How I Hacked a Live Chatbot” →
          </Link>
        </p>
      </div>
    </main>
  );
}
