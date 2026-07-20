"use client";

import { useMemo } from "react";
import { mulberry32, shuffleArray } from "@/lib/shuffle";

/**
 * Returns a seeded RNG function tied to the current session.
 * The seed is stored in sessionStorage so the same order persists
 * across re-renders and component remounts within a session,
 * but changes for each new session.
 */
function getSessionRng(): () => number {
  if (typeof window === "undefined") {
    // SSR fallback — will be re-hydrated on client
    return mulberry32(Date.now());
  }

  const key = "quiz-shuffle-seed";
  let seed = sessionStorage.getItem(key);
  if (!seed) {
    seed = String(Math.floor(Math.random() * 2 ** 32));
    sessionStorage.setItem(key, seed);
  }
  return mulberry32(Number(seed));
}

/**
 * Shuffles an array once per session and returns the stable result.
 * The order is determined by the session seed and does not change
 * on re-renders.
 *
 * @param items - The array to shuffle
 * @param key  - A unique key to cache the shuffled result in sessionStorage
 */
export function useQuizShuffle<T>(items: T[], key: string): T[] {
  return useMemo(() => {
    if (typeof window === "undefined") return items;

    const cacheKey = `quiz-shuffled-${key}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as T[];
        if (parsed.length === items.length) return parsed;
      } catch {
        sessionStorage.removeItem(cacheKey);
      }
    }

    const rng = getSessionRng();
    const shuffled = shuffleArray(items, rng);
    sessionStorage.setItem(cacheKey, JSON.stringify(shuffled));
    return shuffled;
    // Intentionally exclude `items` from deps — we only shuffle once per session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
