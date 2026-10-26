/**
 * Where the city ends and the coast begins, keyed to camera depth.
 * One source of truth so the sky, ground and fog all agree.
 */
export const COAST_START = -100;
export const COAST_END = -132;

/** 0 = deep in the city, 1 = out on the sand. */
export function coastAt(z: number) {
  const t = (COAST_START - z) / (COAST_START - COAST_END);
  return Math.min(1, Math.max(0, t));
}

/** World-space shoreline. Sand is nearer than this, water beyond. */
export const WATER_Z = -152;

/** Shared dusk palette so the sea and the sky meet without a seam. */
export const SUN_DIR = { x: 0.16, y: 0.004, z: -1 };
export const DUSK_COOL = "#b07a7a";
export const DUSK_WARM = "#ff9a6e";
export const SUN_COLOR = "#ff7a4a";
