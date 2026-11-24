"use client";

import { usePathname } from "next/navigation";
import { Chrome } from "./Chrome";

/**
 * The site chrome (top bar, menu, progress, command palette) belongs to the
 * portfolio. Reading routes bring their own frame, so the chrome stays out of
 * the way there.
 */
export function SiteChrome() {
  const pathname = usePathname() ?? "";
  const reading = pathname === "/writeup" || pathname.startsWith("/writeup/");

  if (reading) return null;

  return <Chrome />;
}
