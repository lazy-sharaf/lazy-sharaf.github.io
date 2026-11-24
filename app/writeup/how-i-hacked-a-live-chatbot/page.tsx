import { WriteupArticle } from "../WriteupArticle";
import "../writeup.css";

export const metadata = {
  title: "How I Hacked a Live Chatbot and Earned My First 4-Digit Bounty",
  description:
    "How a wildcard MQTT subscription exposed live customer support conversations — and became a first four-digit bounty.",
  robots: { index: false, follow: false },
};

export default function HowIHackedALiveChatbot() {
  return (
    <WriteupArticle
      sourceFile="chatbot.md"
      eyebrow="Bug bounty writeup · MQTT · HackerOne"
      chip="Private program"
      caseNo="01"
      subtitle="One character in an MQTT topic string — and my first four-digit bounty."
      footerNote="Originally published on Medium, 3 June 2026. Target details redacted. No customer data retained."
    />
  );
}
