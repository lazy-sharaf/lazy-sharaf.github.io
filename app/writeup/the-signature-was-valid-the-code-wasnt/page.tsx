import { WriteupArticle } from "../WriteupArticle";
import "../writeup.css";

export const metadata = {
  title: "The signature was valid. The code wasn't.",
  description:
    "Intigriti 1126 — Super Fast Server: how a valid RSA-2048 signature ran my Brainfuck program.",
  robots: { index: false, follow: false },
};

export default function WriteupPage() {
  return (
    <WriteupArticle
      sourceFile="writeup.md"
      eyebrow="CTF writeup · web & reversing"
      chip="Intigriti 1126"
      caseNo="02"
      footerNote="Reported and written up for Intigriti 1126. The signature was valid; the code was not."
    />
  );
}
