/**
 * Boot progress, shared between the DOM loader and the WebGL scene.
 *
 * The loader must not guess. Each stage is claimed by whoever actually did the
 * work, so the overlay lifts when the 3D scene has really drawn a frame — not
 * when a timer says it probably has.
 *
 *   0  mounted
 *   1  first paint of the shell
 *   2  scene chunk downloaded
 *   3  WebGL context created
 *   4  first frame on screen
 *
 * State lives on `window`, not in module scope: the scene is a separately
 * code-split chunk, and a module-level variable would be a *second* copy of it
 * over there — the scene would claim its stage on an object the loader never
 * sees.
 */

export const BOOT_TOTAL = 4;

type BootState = { stage: number; locked: boolean };

const KEY = "__bootState";

function store(): BootState | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, BootState | undefined>;
  if (!w[KEY]) w[KEY] = { stage: 0, locked: true };
  return w[KEY] as BootState;
}

export function setStage(next: number) {
  const s = store();
  if (!s || next <= s.stage) return;
  s.stage = next;
  window.dispatchEvent(new CustomEvent("boot:stage", { detail: s.stage }));
}

export function getStage() {
  return store()?.stage ?? 0;
}

export function subscribe(fn: (stage: number) => void) {
  const onStage = (e: Event) => fn((e as CustomEvent<number>).detail);
  window.addEventListener("boot:stage", onStage);
  fn(getStage());
  return () => window.removeEventListener("boot:stage", onStage);
}

/**
 * Scroll stays locked while the overlay is up, so the visitor can't drift
 * through the page behind it. Lenis has to be stopped too — it drives scroll
 * itself and would otherwise keep moving an invisible document.
 */
export function setBootLocked(next: boolean) {
  const s = store();
  if (!s || s.locked === next) return;
  s.locked = next;
  window.dispatchEvent(new CustomEvent("boot:lock", { detail: next }));
}

export function isBootLocked() {
  return store()?.locked ?? false;
}

export function onBootLock(fn: (locked: boolean) => void) {
  const onLock = (e: Event) => fn((e as CustomEvent<boolean>).detail);
  window.addEventListener("boot:lock", onLock);
  fn(isBootLocked());
  return () => window.removeEventListener("boot:lock", onLock);
}

/**
 * Dead-man switch. If the scene never reports — a driver that stalls, a shader
 * that hangs, a throttled background tab — the overlay would otherwise sit on
 * top of the site forever. This releases it from outside React, so it works
 * even if the component tree is wedged.
 */
if (typeof window !== "undefined") {
  window.setTimeout(() => {
    if (isBootLocked()) {
      setStage(BOOT_TOTAL);
      delete document.documentElement.dataset.boot;
      setBootLocked(false);
    }
  }, 15000);
}
