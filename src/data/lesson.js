// Lesson-builder settings chosen on the landing page ("Build your lesson").
// Persisted per browser so a teacher's choices survive a refresh.
//
//   interaction  projector | tablet | phones   — how the room answers (see src/data/room.js)
//   math         off | light | full            — reserved for the math-moments phase
//   checks       none | polls | quiz | both    — quick polls after each act / class quiz at the end

import { createContext, useContext } from "react";

const KEY = "iknowgenai_lesson";

export const INTERACTION_MODES = [
  { id: "projector", label: "Projector only", short: "Projector", desc: "No student devices. Kids answer out loud; the teacher taps the tally." },
  { id: "tablet", label: "Pass one tablet around", short: "Tablet", desc: "One paired tablet travels the room. Every tap is one vote. No QR code is shown." },
  { id: "phones", label: "Phones join by QR", short: "Phones", desc: "Everyone joins with a code. One vote per phone, only while a question is open." },
];

export const MATH_LEVELS = [
  { id: "off", label: "Off" },
  { id: "light", label: "Light", desc: "One math moment per act: counting, fractions and percent, chance, big numbers, coordinates, averages." },
  { id: "full", label: "Full", desc: "Light, plus a numbers strip on every other quantitative slide (× 4, layer passes, ratios, decimals that sum to 1)." },
];

export const CHECK_LEVELS = [
  { id: "none", label: "None" },
  { id: "polls", label: "Quick polls", desc: "One predict-then-reveal question at the end of each act." },
  { id: "quiz", label: "End quiz", desc: "The Knowledge Check as a class: one vote per question on the projector, then 'in your own words'." },
  { id: "both", label: "Both", desc: "Quick polls between acts and the class quiz at the end." },
];

const DEFAULTS = { interaction: "projector", math: "off", checks: "none" };

export function loadLesson() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || "{}");
    const out = { ...DEFAULTS };
    if (INTERACTION_MODES.some(m => m.id === stored.interaction)) out.interaction = stored.interaction;
    if (MATH_LEVELS.some(m => m.id === stored.math && !m.soon)) out.math = stored.math;
    if (CHECK_LEVELS.some(m => m.id === stored.checks && !m.soon)) out.checks = stored.checks;
    return out;
  } catch {
    return { ...DEFAULTS };
  }
}

/** The active lesson settings, provided by App. Defaults apply outside a provider (e.g. the 14+ course never uses this). */
export const LessonContext = createContext(DEFAULTS);
export function useLesson() {
  return useContext(LessonContext) || DEFAULTS;
}

export function saveLesson(lesson) {
  try { localStorage.setItem(KEY, JSON.stringify(lesson)); } catch { /* private mode */ }
}
