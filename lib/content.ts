/**
 * Single source of truth for every string on the site.
 * Every claim here is verifiable from the CV or the published writeup.
 */

export const site = {
  name: "Mahbubur Rahman Soraf",
  shortName: "Soraf",
  handle: "lazysharaf",
  role: "Security Researcher",
  subRole: "Penetration Tester · Bug Bounty Hunter",
  location: "Dhaka, Bangladesh",
  domain: "sharaf.ninja",
  url: "https://sharaf.ninja",
  year: 2026,
  tagline: "Boring recon wins.",
  status: "Breaking things responsibly since 2022.",
  intro:
    "Finding what shouldn’t exist. Security researcher working on web application security and real-world vulnerability discovery — UNESCO, the World Health Organization, UNICEF and the U.S. Department of Education among those disclosed to.",
  introLead: "Finding what",
  introAccent: "shouldn’t exist.",
  introBody:
    "Most of what I find never gets a logo. The names on this page are the organisations reputable enough to say it publicly — the rest of the work stays quiet. None of the bugs were exotic. Nobody had looked.",
  about:
    "Security researcher working on web application security and real-world vulnerability discovery. I report what I find to the organisations that own it — UNESCO, the World Health Organization, UNICEF, Adyen, the U.S. Department of Education, the University of York, the University of Sheffield and Utrecht University among them.",
  aboutSecond:
    "Day to day that means penetration testing, security research and vulnerability assessment, concentrated on web-based attack vectors: authentication flaws, broken access control, misconfiguration and business logic. I write findings the way I would want to receive them — reproducible, clearly scoped, and with remediation an engineer can act on.",
  aboutTags: [
    "Penetration testing",
    "Vulnerability assessment",
    "Security research",
    "Responsible disclosure",
    "Bug bounty",
    "CTF player",
  ],
  email: "mahbuburrahmansoraf@gmail.com",
  github: "https://github.com/lazy-sharaf",
  githubLabel: "github.com/lazy-sharaf",
  medium: "https://medium.com/@lazysharaf",
  mediumLabel: "medium.com/@lazysharaf",
  linkedin: "https://linkedin.com/in/lazysharaf",
  x: "https://x.com/lazy_sharaf",
  facebook: "https://facebook.com/lazysharaf",
  /**
   * PGP — placeholder until a key is supplied.
   * The Contact section renders a "key not published" state rather than faking a fingerprint.
   */
  pgp: {
    published: false,
    fingerprint: null as string | null,
    keyUrl: null as string | null,
  },
} as const;

/** Full writeups, one card each, in the homepage Writeups section. */
export type Writeup = {
  id: string;
  codename: string;
  category: string;
  oneLiner: string;
  href: string;
  readLabel: string;
  meta: { label: string; value: string }[];
  badge?: string;
};

export const writeups: Writeup[] = [
  {
    id: "CASE 001",
    codename: "How I Hacked a Live Chatbot",
    category: "Bug bounty · MQTT",
    oneLiner: "One `+` in an MQTT topic string.",
    href: "/writeup/how-i-hacked-a-live-chatbot",
    readLabel: "Read the writeup",
    meta: [
      { label: "Target", value: "Live support chatbot" },
      { label: "Severity", value: "Critical" },
      { label: "Outcome", value: "First 4-digit bounty" },
    ],
  },
  {
    id: "CASE 002",
    codename: "The signature was valid. The code wasn't.",
    category: "CTF · RSA / Brainfuck",
    oneLiner: "A valid signature, a different offset, the flag.",
    href: "/writeup/the-signature-was-valid-the-code-wasnt",
    readLabel: "Read the writeup",
    meta: [
      { label: "Challenge", value: "Intigriti 1126" },
      { label: "Protocol", value: "Custom · RSA-2048" },
      { label: "Outcome", value: "Flag captured" },
    ],
    badge: "EMBARGOED · local only",
  },
];

export type Recognition = {
  org: string;
  short: string;
  year: string;
  kind: string;
  image: string;
  note: string;
};

export const recognitions: Recognition[] = [
  {
    org: "NASA",
    short: "NASA",
    year: "2026",
    kind: "Letter of Recognition",
    image: "/recognitions/nasa.jpg",
    note: "Letter of appreciation from the National Aeronautics and Space Administration for a vulnerability reported under NASA's Vulnerability Disclosure Policy.",
  },
  {
    org: "World Health Organization",
    short: "WHO",
    year: "2024",
    kind: "Hall of Fame",
    image: "/recognitions/who.jpeg",
    note: "Listed on the WHO Vulnerability Hall of Fame for an information disclosure on a WHO subdomain.",
  },
  {
    org: "UNESCO",
    short: "UNESCO",
    year: "2024",
    kind: "Hall of Fame",
    image: "/recognitions/unesco.jpeg",
    note: "Named on the UNESCO Hall of Fame for a security misconfiguration affecting a UNESCO domain.",
  },
  {
    org: "UNICEF",
    short: "UNICEF",
    year: "2024",
    kind: "Hall of Fame",
    image: "/recognitions/unicef.png",
    note: "Credited on the UNICEF Hall of Fame for an information disclosure report.",
  },
  {
    org: "U.S. Department of Education",
    short: "U.S. DEPT OF EDUCATION",
    year: "2024",
    kind: "Certificate of Recognition",
    image: "/recognitions/usedu.jpeg",
    note: "Certificate of Recognition for reporting and responsibly disclosing exploitable vulnerabilities.",
  },
  {
    org: "University of Sheffield",
    short: "UNIV. OF SHEFFIELD",
    year: "2024",
    kind: "Hall of Fame",
    image: "/recognitions/sheffield.png",
    note: "Acknowledged by University of Sheffield IT Services for a security report.",
  },
  {
    org: "University of York",
    short: "UNIV. OF YORK",
    year: "2024",
    kind: "Hall of Fame",
    image: "/recognitions/york.png",
    note: "Listed in the University of York credits for helping with vulnerability reports.",
  },
];

export const numbers = [
  { value: "545", label: "teams at BDSec CTF 2026", sub: "placed 2nd" },
  { value: "06", label: "CTF & competition results" },
  { value: "03", label: "tools built and released" },
  { value: "08", label: "certifications" },
];

/**
 * ASCII banners carried over from the previous portfolio.
 * String.raw keeps the backslashes literal.
 */
export const toolAscii: Record<string, string> = {
  GhostJS: String.raw`  ____ _               _          _ ____
 / ___| |__   ___  ___| |_       | / ___|
| |  _| '_ \ / _ \/ __| __|   _  | \___ \
| |_| | | | | (_) \__ \ |_   | |_| |___) |
 \____|_| |_|\___/|___/\__|   \___/|____/`,
  React2Shell: String.raw` ____   ___  ____
|  _ \ / _ \/ ___|
| |_) | | | \___ \
|  _ <| |_| |___) |
|_| \_\___/|____/`,
  OopsCrawler: String.raw`  ___                  ____                      _
 / _ \  ___  __ _ ___/ ___|_ __ __ ___      _| | ___ _ __
| | | |/ _ \| '_ \/ __| |   | '__/ _' \ \ /\ / / |/ _ \ '__|
| |_| | (_) | |_) \__ \ |___| | | (_| |\ V  V /| |  __/ |
 \___/ \___/| .__/|___/\____|_|  \__,_| \_/\_/ |_|\___|_|`,
};

export type Tool = {
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  href: string | null;
  highlight?: string;
};

export const tools: Tool[] = [
  {
    name: "GhostJS",
    tagline: "JavaScript recon at scale",
    description:
      "Crawls domains for JavaScript files and pulls out API keys, secrets and hardcoded URLs using pattern matching and entropy analysis. Modern apps leak infrastructure inside bundles; GhostJS makes that leak legible.",
    tags: ["Python", "Regex", "Entropy", "Automation"],
    href: null,
  },
  {
    name: "React2Shell",
    tagline: "CVE-2025-55182 validation",
    description:
      "A proof-of-concept scanner and exploit tool for the React Server Components RCE. Verifies real impact across large deployments with multi-threaded, localised command testing.",
    tags: ["Python", "Exploit Dev", "CVE-2025-55182"],
    href: null,
    highlight: "CVE-2025-55182",
  },
  {
    name: "OopsCrawler",
    tagline: "Recursive link validation",
    description:
      "Recursively crawls a site for broken links, blocked paths and HTTP errors, then reports only what is actually broken as CSV. Built for maintaining high availability on large estates.",
    tags: ["Python", "Requests", "BeautifulSoup"],
    href: null,
  },
];

export type Competition = {
  year: string;
  name: string;
  result: string;
  detail: string;
};

export const competitions: Competition[] = [
  {
    year: "2026",
    name: "BCS ICT Fest CTF",
    result: "15th",
    detail: "Team position worldwide",
  },
  {
    year: "2026",
    name: "BDSec CTF",
    result: "2nd Runner-up",
    detail: "545 teams worldwide",
  },
  {
    year: "2026",
    name: "HackerOne Bug Hunt",
    result: "Finalist",
    detail: "Top 20",
  },
  {
    year: "2025",
    name: "Technonext Cyber Invasion",
    result: "Finalist",
    detail: "Top 20",
  },
  {
    year: "2025",
    name: "DIU CyberCon National CTF",
    result: "Finalist",
    detail: "Top 10 individual",
  },
  {
    year: "2023",
    name: "Bugcrowd Hacker Cup 3",
    result: "Top 20",
    detail: "Worldwide team position",
  },
];

export const organising = {
  year: "2026",
  name: "CSAD CSC CyberWar",
  role: "Organiser & Problem Setter",
  detail:
    "Authored original challenges in web security, cryptography and real-world attack scenarios. Managed challenge deployment, infrastructure and live participant support.",
};

export type SkillGroup = {
  group: string;
  items: string[];
};

export const skills: SkillGroup[] = [
  {
    group: "Security tools",
    items: [
      "Burp Suite",
      "Metasploit",
      "Nuclei",
      "Nmap",
      "Wireshark",
      "OWASP ZAP",
      "ffuf",
      "Gobuster",
    ],
  },
  {
    group: "Web security",
    items: [
      "XSS",
      "SQL injection",
      "SSRF",
      "Auth bypass",
      "Broken access control",
      "Business logic",
      "API hacking",
    ],
  },
  {
    group: "Active / passive recon",
    items: [
      "Subfinder",
      "Amass",
      "Httpx",
      "Shodan",
      "Assetfinder",
      "Censys",
      "GitHub recon",
      "Wayback Machine",
    ],
  },
  {
    group: "Core",
    items: [
      "Web fundamentals",
      "Linux",
      "JavaScript",
      "Python",
      "OSI model",
      "Bash",
    ],
  },
];

export type Credential = {
  name: string;
  issuer: string;
  year: string;
  image?: string;
  note?: string;
};

export const credentials: Credential[] = [
  {
    name: "Certified API Security Analyst (CASA)",
    issuer: "APIsec University",
    year: "2026",
    image: "/certs/casa.jpeg",
    note: "Awarded 09 October 2026. Examination administered by APIsec University.",
  },
  {
    name: "APIsec Certified Practitioner (ACP)",
    issuer: "APIsec University",
    year: "2026",
    image: "/certs/acp.jpeg",
    note: "Awarded 11 October 2026. Examination administered by APIsec University.",
  },
  {
    name: "Certified AppSec Practitioner v2",
    issuer: "The SecOps Group",
    year: "2024",
    image: "/certs/cap.png",
  },
  {
    name: "Certified Network Security Practitioner",
    issuer: "The SecOps Group",
    year: "2024",
    image: "/certs/cnsp.png",
  },
  {
    name: "Google Cybersecurity Professional Certificate",
    issuer: "Coursera",
    year: "2025",
    image: "/certs/google.jpeg",
    note: "Eight-course professional certificate delivered through Coursera.",
  },
  {
    name: "Certified API Hacking Junior",
    issuer: "The XSS Rat",
    year: "2025",
    image: "/certs/capij.png",
  },
  {
    name: "Certified Cybersecurity Educator Professional",
    issuer: "Red Team Leaders",
    year: "2025",
    image: "/certs/ccep.png",
  },
  {
    name: "Certified Web App Pentesting Apprentice",
    issuer: "Knight Squad Academy",
    year: "2026",
    image: "/certs/kwapta.png",
  },
];

export type Experience = {
  period: string;
  title: string;
  org: string;
  points: string[];
};

export const experience: Experience[] = [
  {
    period: "Jul 2026 — Sep 2026",
    title: "Pentest Engineer (Contractual)",
    org: "Cyber Security Centre, Daffodil International University",
    points: [
      "Conducted penetration testing and vulnerability assessments across web applications, APIs and network environments.",
      "Identified, validated and documented vulnerabilities with impact analysis and actionable remediation guidance.",
    ],
  },
  {
    period: "2022 — Present",
    title: "Security Researcher & Bug Bounty Hunter",
    org: "Independent",
    points: [
      "Discovered and responsibly reported web security vulnerabilities to leading organisations, receiving recognition from UNESCO, WHO, UNICEF, Adyen, the University of York, the University of Sheffield and the U.S. Department of Education.",
      "Specialised in authentication flaws, broken access control, misconfigurations and insecure implementations.",
    ],
  },
];

export const education = {
  period: "2022 — 2026",
  degree: "B.Sc. Software Engineering",
  org: "Daffodil International University",
  detail: "Major in Cyber Security",
};

export const ethicsQuote = {
  quote: "I stopped once the flaw was proven. Everything past that point was someone else’s data.",
  attribution: "Case 001",
};

export type IndexEntry = {
  path: string;
  title: string;
  note: string;
  count: string;
  href: string;
};

/**
 * The directory listing. Doubles as the site's table of contents and as
 * the shell-session motif carried over from the previous portfolio.
 */
export const indexEntries: IndexEntry[] = [
  {
    path: "~/recognition",
    title: "Recognition",
    note: "NASA · WHO · UNESCO · UNICEF · U.S. DoE · Sheffield · York",
    count: "08 entries",
    href: "#record",
  },
  {
    path: "~/projects",
    title: "Projects & tools",
    note: "GhostJS · React2Shell · OopsCrawler",
    count: "03 entries",
    href: "#tooling",
  },
  {
    path: "~/ctf",
    title: "CTF & competitions",
    note: "BCS ICT Fest 2026 · BDSec 2026 · Bugcrowd Cup",
    count: "06 results",
    href: "#competitions",
  },
  {
    path: "~/certs",
    title: "Certifications",
    note: "APIsec University · SecOps Group · The XSS Rat",
    count: "08 entries",
    href: "#certifications",
  },
  {
    path: "~/experience",
    title: "Experience",
    note: "DIU Cyber Security Centre · independent research",
    count: "02 roles",
    href: "#experience",
  },
  {
    path: "~/ethics",
    title: "Ethics",
    note: "Disclosure practice, and the discipline of stopping",
    count: "01 note",
    href: "#ethics",
  },
  {
    path: "~/writeups",
    title: "Writeups",
    note: "The Wildcard · Super Fast Server · how the bugs were found",
    count: "02 entries",
    href: "#writeup",
  },
];

export type Section = {
  id: string;
  label: string;
  number: string;
  path: string;
};

/**
 * The section map. Numbers here are the same ones rendered by SectionHead,
 * so the bar, the mobile menu and the page markers can never drift apart.
 */
export const sections: Section[] = [
  { id: "hero", label: "Home", number: "—", path: "~/" },
  { id: "index", label: "Index", number: "00", path: "~/" },
  { id: "about", label: "About", number: "01", path: "~/about" },
  { id: "skills", label: "Skills", number: "02", path: "~/skills" },
  { id: "record", label: "Recognition", number: "03", path: "~/record" },
  { id: "tooling", label: "Projects", number: "04", path: "~/bin" },
  { id: "competitions", label: "CTF", number: "05", path: "~/ctf" },
  { id: "certifications", label: "Certifications", number: "06", path: "~/certs" },
  { id: "experience", label: "Experience", number: "07", path: "~/cv" },
  { id: "ethics", label: "Ethics", number: "08", path: "~/ethics" },
  { id: "writeup", label: "Writeups", number: "09", path: "~/writeups" },
  { id: "contact", label: "Contact", number: "10", path: "~/contact" },
];

export const nav = sections.map(({ id, label }) => ({ id, label }));

/**
 * The six that earn a slot in the bar. Everything else lives in ⌘K
 * and in the index listing — a bar with twelve links is a table of
 * contents pretending to be navigation.
 */
export const navPrimary = [
  { id: "about", label: "about" },
  { id: "record", label: "record" },
  { id: "writeup", label: "writeups" },
  { id: "tooling", label: "projects" },
  { id: "experience", label: "cv" },
  { id: "contact", label: "contact" },
].map((item) => ({
  ...item,
  number: sections.find((s) => s.id === item.id)?.number ?? "",
}));
