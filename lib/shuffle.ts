/**
 * Quiz shuffle utilities — deterministic PRNG + Fisher-Yates shuffle
 *
 * Uses mulberry32 PRNG for reproducible shuffles per session,
 * and Fisher-Yates algorithm for unbiased random permutations.
 */

/**
 * Mulberry32 — simple 32-bit seeded PRNG.
 * Returns a function that produces values in [0, 1).
 * Seed comes from sessionStorage (set once per session).
 */
export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates (Knuth) shuffle — in-place, unbiased.
 * Returns a NEW array (does not mutate the original).
 */
export function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Given a shuffled array and a target value, return the original index.
 * Useful when the correct answer index must be tracked after shuffling.
 */
export function getOriginalIndex<T>(
  shuffled: T[],
  original: T[],
  target: T,
): number {
  return original.indexOf(target);
}
