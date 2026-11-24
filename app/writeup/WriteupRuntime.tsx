"use client";

import { useEffect } from "react";

/**
 * Progressive enhancement for the writeup: scroll progress, the active
 * table-of-contents entry, copy buttons, the figure lightbox and the
 * quiet reveal-on-scroll. Everything here is optional — with JS off the
 * page is still a complete, readable article.
 */
export function WriteupRuntime() {
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>("[data-progress]");
    const railBar = document.querySelector<HTMLElement>("[data-progress-rail]");
    const progressLabel = document.querySelector<HTMLElement>("[data-progress-label]");
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>(".wu-prose h2[id], .wu-prose h3[id]"),
    );
    const links = new Map<string, HTMLElement[]>();
    document.querySelectorAll<HTMLElement>("[data-toc]").forEach((link) => {
      const id = link.dataset.toc ?? "";
      const list = links.get(id) ?? [];
      list.push(link);
      links.set(id, list);
    });

    /* -------------------------------------------------- scroll state */
    let frame = 0;

    const update = () => {
      frame = 0;

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const percent = Math.round(progress * 100);
      if (bar) bar.style.width = `${(progress * 100).toFixed(2)}%`;
      if (railBar) railBar.style.width = `${(progress * 100).toFixed(2)}%`;
      if (progressLabel) progressLabel.textContent = `${percent}%`;

      let current: string | null = null;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= 140) current = heading.id;
        else break;
      }

      links.forEach((elements, id) => {
        const active = id === current;
        elements.forEach((element) => {
          if (active) element.dataset.active = "true";
          else delete element.dataset.active;
        });
      });
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    /* -------------------------------------------------- copy buttons */
    let copyTimer = 0;

    const writeClipboard = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand("copy");
        area.remove();
        return ok;
      }
    };

    const onCopy = async (event: MouseEvent) => {
      const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("[data-copy]");
      if (!button) return;

      const explicit = button.dataset.copyText;
      const block = button.closest(".wu-code");
      const text = explicit ?? block?.querySelector("pre")?.textContent ?? "";
      if (!text) return;

      const ok = await writeClipboard(text);
      const original = button.textContent ?? "Copy";
      button.textContent = ok ? "Copied" : "Copy failed";
      button.dataset.copied = ok ? "true" : "false";

      window.clearTimeout(copyTimer);
      copyTimer = window.setTimeout(() => {
        button.textContent = original;
        delete button.dataset.copied;
      }, 1600);
    };

    document.addEventListener("click", onCopy);

    /* -------------------------------------------------- lightbox */
    let lightbox: HTMLElement | null = null;
    let lightboxImage: HTMLImageElement | null = null;
    let lightboxCaption: HTMLElement | null = null;
    let lastFocus: HTMLElement | null = null;

    const buildLightbox = () => {
      const element = document.createElement("div");
      element.className = "wu-lightbox";
      element.setAttribute("role", "dialog");
      element.setAttribute("aria-modal", "true");
      element.setAttribute("aria-label", "Figure preview");
      element.innerHTML = `
        <button type="button" class="wu-lightbox-close" aria-label="Close preview">
          <svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>
        <figure>
          <div class="wu-lightbox-scroll"><img alt=""></div>
          <figcaption></figcaption>
        </figure>`;
      // Keep it inside .wu so the theme's custom properties resolve.
      (document.querySelector(".wu") ?? document.body).appendChild(element);
      return element;
    };

    const closeLightbox = () => {
      if (!lightbox) return;
      lightbox.dataset.open = "false";
      document.body.classList.remove("wu-locked");
      lastFocus?.focus();
      lastFocus = null;
    };

    const onLightboxClick = (event: MouseEvent) => {
      const trigger = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-lightbox]");
      if (!trigger) return;

      const figure = trigger.closest<HTMLElement>(".wu-shot");
      const image = trigger.querySelector("img");
      if (!image) return;

      if (!lightbox) {
        lightbox = buildLightbox();
        lightboxImage = lightbox.querySelector("img");
        lightboxCaption = lightbox.querySelector("figcaption");

        lightbox.addEventListener("click", (event) => {
          const target = event.target as HTMLElement;
          if (target === lightbox || target.closest(".wu-lightbox-close")) closeLightbox();
        });
      }

      if (lightboxImage) {
        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = image.alt;
      }
      if (lightboxCaption) {
        lightboxCaption.innerHTML = figure?.querySelector("figcaption")?.innerHTML ?? "";
      }

      lastFocus = document.activeElement as HTMLElement | null;
      lightbox.dataset.open = "true";
      document.body.classList.add("wu-locked");
      lightbox.querySelector<HTMLButtonElement>(".wu-lightbox-close")?.focus();
    };

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
    };

    document.addEventListener("click", onLightboxClick);
    document.addEventListener("keydown", onKeydown);

    /* -------------------------------------------------- mobile toc */
    const mobileToc = document.querySelector<HTMLDetailsElement>(".wu-toc-mobile");
    const onMobileTocClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest("a") && mobileToc) mobileToc.open = false;
    };
    mobileToc?.addEventListener("click", onMobileTocClick);

    /* -------------------------------------------------- cleanup */
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("click", onCopy);
      document.removeEventListener("click", onLightboxClick);
      document.removeEventListener("keydown", onKeydown);
      mobileToc?.removeEventListener("click", onMobileTocClick);
      lightbox?.remove();
      document.body.classList.remove("wu-locked");
    };
  }, []);

  return null;
}
