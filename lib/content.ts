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
  location: "Savar, Dhaka, Bangladesh",
  domain: "sharaf.ninja",
  url: "https://sharaf.ninja",
  year: 2026,
  tagline: "Boring recon wins.",
  status: "Breaking things responsibly since 2022.",
  intro:
    "I look for what was already public. Eight organisations have received disclosures from me — WHO, UNESCO, UNICEF and the U.S. Department of Education among them. The bugs were never exotic. Nobody had looked.",
  about:
    "Security researcher with a focus on web application security and real-world vulnerability discovery. I have responsibly disclosed vulnerabilities to international organisations including UNESCO, WHO, UNICEF, Adyen, the U.S. Department of Education, the University of York and the University of Sheffield.",
  aboutSecond:
    "My work concentrates on web-based attack vectors — authentication flaws, broken access control, misconfigurations and business logic. I write findings the way I would want to receive them: reproducible, scoped, and with remediation an engineer can act on.",
  aboutTags: [
    "Penetration testing",
    "Bug bounty",
    "CTF player",
    "Security research",
    "Responsible disclosure",
  ],
  email: "mahbuburrahmansoraf@gmail.com",
  github: "https://github.com/lazysharaf",
  githubLabel: "github.com/lazysharaf",
  medium: "https://medium.com/@lazysharaf",
  mediumLabel: "medium.com/@lazysharaf",
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

export type CaseStudy = {
  id: string;
  codename: string;
  target: string;
  program: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  year: string;
  outcome: string;
  oneLiner: string;
  stats: { value: string; unit: string; label: string }[];
  href: string;
  external: boolean;
};

export const featuredCase: CaseStudy = {
  id: "CASE 001",
  codename: "THE WILDCARD",
  target: "Live customer support chatbot",
  program: "Private HackerOne program",
  severity: "Critical",
  year: "2026",
  outcome: "First 4-digit bounty",
  oneLiner: "One `+` in an MQTT topic string.",
  stats: [
    { value: "88", unit: "messages", label: "received" },
    { value: "10", unit: "sessions", label: "not mine" },
    { value: "03", unit: "minutes", label: "before I stopped" },
  ],
  href: "/case/the-wildcard",
  external: false,
};

export type Recognition = {
  org: string;
  short: string;
  year: string;
  kind: string;
};

export const recognitions: Recognition[] = [
  { org: "World Health Organization", short: "WHO", year: "2024", kind: "Hall of Fame" },
  { org: "UNESCO", short: "UNESCO", year: "2024", kind: "Hall of Fame" },
  { org: "UNICEF", short: "UNICEF", year: "2024", kind: "Hall of Fame" },
  {
    org: "U.S. Department of Education",
    short: "U.S. DEPT OF EDUCATION",
    year: "2024",
    kind: "Certificate of Recognition",
  },
  { org: "University of Sheffield", short: "UNIV. OF SHEFFIELD", year: "2024", kind: "Hall of Fame" },
  { org: "University of York", short: "UNIV. OF YORK", year: "2024", kind: "Hall of Fame" },
];

/** Disclosed to, but with no public recognition listed on the CV. */
export const additionalDisclosures = ["Adyen", "Utrecht University"];

export const numbers = [
  { value: "08", label: "organisations disclosed to" },
  { value: "545", label: "teams at BDSec CTF 2026", sub: "placed 2nd" },
  { value: "05", label: "CTF & competition results" },
  { value: "03", label: "tools built and released" },
  { value: "06", label: "certifications" },
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
};

export const credentials: Credential[] = [
  { name: "Certified AppSec Practitioner v2", issuer: "The SecOps Group", year: "2024" },
  { name: "Certified Network Security Practitioner", issuer: "The SecOps Group", year: "2024" },
  { name: "Google Cybersecurity Professional Certificate", issuer: "Coursera", year: "2025" },
  { name: "Certified API Hacking Junior", issuer: "The XSS Rat", year: "2025" },
  { name: "Certified Cybersecurity Educator Professional", issuer: "Red Team Leaders", year: "2025" },
  { name: "Certified Web App Pentesting Apprentice", issuer: "Knight Squad Academy", year: "2026" },
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
  quote: "I let it run for three minutes, then I stopped. I did not need to hoard data.",
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
    path: "~/case-001",
    title: "The Wildcard",
    note: "Critical MQTT authorisation flaw · first 4-digit bounty",
    count: "01 entry",
    href: "#case",
  },
  {
    path: "~/recognition",
    title: "Recognition",
    note: "WHO · UNESCO · UNICEF · U.S. DoE · Sheffield · York",
    count: "06 entries",
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
    note: "BDSec 2026 · HackerOne Bug Hunt · Bugcrowd Cup",
    count: "05 results",
    href: "#competitions",
  },
  {
    path: "~/certs",
    title: "Certifications",
    note: "SecOps Group · The XSS Rat · Knight Squad Academy",
    count: "06 entries",
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
  { id: "case", label: "Case 001", number: "04", path: "~/case/001" },
  { id: "tooling", label: "Projects", number: "05", path: "~/bin" },
  { id: "competitions", label: "CTF", number: "06", path: "~/ctf" },
  { id: "certifications", label: "Certifications", number: "07", path: "~/certs" },
  { id: "experience", label: "Experience", number: "08", path: "~/cv" },
  { id: "ethics", label: "Ethics", number: "09", path: "~/ethics" },
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
  { id: "case", label: "case 001" },
  { id: "tooling", label: "projects" },
  { id: "experience", label: "cv" },
  { id: "contact", label: "contact" },
].map((item) => ({
  ...item,
  number: sections.find((s) => s.id === item.id)?.number ?? "",
}));
