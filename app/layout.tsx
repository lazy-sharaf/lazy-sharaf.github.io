import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { site } from "@/lib/content";
import { Chrome } from "@/components/dom/Chrome";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { SceneMount } from "@/components/three/SceneMount";
import { WildcardCursor } from "@/components/ui/WildcardCursor";
import { Loader } from "@/components/ui/Loader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.intro,
  applicationName: site.shortName,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  keywords: [
    "security researcher",
    "penetration tester",
    "bug bounty hunter",
    "web application security",
    "responsible disclosure",
    "Mahbubur Rahman Soraf",
    "lazysharaf",
    "Bangladesh",
  ],
  openGraph: {
    type: "profile",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.tagline,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: site.handle,
  jobTitle: `${site.role} · ${site.subRole}`,
  description: site.intro,
  url: site.url,
  email: `mailto:${site.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Savar",
    addressRegion: "Dhaka",
    addressCountry: "BD",
  },
  sameAs: [site.github, site.medium],
  knowsAbout: [
    "Web application security",
    "Penetration testing",
    "Responsible disclosure",
    "Broken access control",
    "API security",
  ],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Daffodil International University",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="grain min-h-full">
        <noscript>
          <style>{`#boot{display:none}`}</style>
        </noscript>
        <a href="#main" className="skip-link sr-only-focusable">
          Skip to content
        </a>
        <SmoothScroll />
        <Loader />
        <SceneMount />
        <WildcardCursor />
        <Chrome />
        <main id="main" className="relative z-10">
          {children}
        </main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </body>
    </html>
  );
}
