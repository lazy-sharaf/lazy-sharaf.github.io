import { Hero } from "@/components/dom/Hero";
import { IndexSection } from "@/components/dom/IndexSection";
import { About } from "@/components/dom/About";
import { Skills } from "@/components/dom/Skills";
import { DisclosureRecord } from "@/components/dom/DisclosureRecord";
import { CaseWildcard } from "@/components/dom/CaseWildcard";
import { Tooling } from "@/components/dom/Tooling";
import { Competitions } from "@/components/dom/Competitions";
import { Certifications } from "@/components/dom/Certifications";
import { Experience } from "@/components/dom/Experience";
import { Ethics } from "@/components/dom/Ethics";
import { Contact } from "@/components/dom/Contact";

/**
 * Section order follows the previous portfolio:
 * hero → index → about → skills → recognition → work → ctf → certs → experience.
 * Case 001 is the one insertion — it sits where "featured work" belongs.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <IndexSection />
      <About />
      <Skills />
      <DisclosureRecord />
      <CaseWildcard />
      <Tooling />
      <Competitions />
      <Certifications />
      <Experience />
      <Ethics />
      <Contact />
    </>
  );
}
