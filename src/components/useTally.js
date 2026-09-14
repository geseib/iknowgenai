// Vote-count state for the classroom Tally / PredictGate components.
// Kept separate from classroom.jsx so that file only exports components
// (React fast-refresh requirement). Import the hooks from either module.

import { useState, useCallback } from "react";

/* ── State hooks ─────────────────────────────────────────────────────── */

/** One tally over n options. Returns { counts, total, inc, dec, reset, leader }. */
export function useTally(n) {
  const [counts, setCounts] = useState(() => Array(n).fill(0));
  const inc = useCallback((i) => setCounts(c => c.map((v, j) => (j === i ? v + 1 : v))), []);
  const dec = useCallback((i) => setCounts(c => c.map((v, j) => (j === i ? Math.max(0, v - 1) : v))), []);
  const reset = useCallback(() => setCounts(Array(n).fill(0)), [n]);
  const total = counts.reduce((a, b) => a + b, 0);
  const leader = leaderOf(counts);
  return { counts, total, inc, dec, reset, leader };
}

/** k independent tallies of n options each (e.g. one per round). Returns an array of handles. */
export function useTallySet(k, n) {
  const [all, setAll] = useState(() => Array.from({ length: k }, () => Array(n).fill(0)));
  const resetAll = useCallback(() => setAll(Array.from({ length: k }, () => Array(n).fill(0))), [k, n]);
  const handles = all.map((counts, t) => ({
    counts,
    total: counts.reduce((a, b) => a + b, 0),
    leader: leaderOf(counts),
    inc: (i) => setAll(s => s.map((c, u) => (u === t ? c.map((v, j) => (j === i ? v + 1 : v)) : c))),
    dec: (i) => setAll(s => s.map((c, u) => (u === t ? c.map((v, j) => (j === i ? Math.max(0, v - 1) : v)) : c))),
    reset: () => setAll(s => s.map((c, u) => (u === t ? Array(n).fill(0) : c))),
  }));
  handles.resetAll = resetAll;
  return handles;
}

/** Index of the strict leader, or null when there are no votes or a tie. */
export function leaderOf(counts) {
  let best = -1, bestIdx = null, tie = false;
  counts.forEach((v, i) => {
    if (v > best) { best = v; bestIdx = i; tie = false; }
    else if (v === best && v > 0) tie = true;
  });
  return best > 0 && !tie ? bestIdx : null;
}

