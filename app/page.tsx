import { Hero } from "@/components/dom/Hero";
import { Preface } from "@/components/dom/Preface";
import { IndexSection } from "@/components/dom/IndexSection";
import { About } from "@/components/dom/About";
import { Skills } from "@/components/dom/Skills";
import { DisclosureRecord } from "@/components/dom/DisclosureRecord";
import { Writeups } from "@/components/dom/Writeups";
import { Tooling } from "@/components/dom/Tooling";
import { Competitions } from "@/components/dom/Competitions";
import { Certifications } from "@/components/dom/Certifications";
import { Experience } from "@/components/dom/Experience";
import { Ethics } from "@/components/dom/Ethics";
import { Contact } from "@/components/dom/Contact";

/**
 * Section order: hero → index → about → skills → recognition → projects → ctf
 * → certs → experience → ethics → writeup → contact.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Preface />
      <IndexSection />
      <About />
      <Skills />
      <DisclosureRecord />
      <Tooling />
      <Competitions />
      <Certifications />
      <Experience />
      <Ethics />
      <Writeups />
      <Contact />
    </>
  );
}
