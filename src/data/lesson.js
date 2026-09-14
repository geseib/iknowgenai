// Lesson-builder settings chosen on the landing page ("Build your lesson").
// Persisted per browser so a teacher's choices survive a refresh.
//
//   interaction  projector | tablet | phones   — how the room answers (see src/data/room.js)
//   math         off | light | full            — reserved for the math-moments phase
//   checks       none | polls | quiz | both    — reserved for the checks phase

const KEY = "iknowgenai_lesson";

export const INTERACTION_MODES = [
  { id: "projector", label: "Projector only", short: "Projector", desc: "No student devices. Kids answer out loud; the teacher taps the tally." },
  { id: "tablet", label: "Pass one tablet around", short: "Tablet", desc: "One paired tablet travels the room. Every tap is one vote. No QR code is shown." },
  { id: "phones", label: "Phones join by QR", short: "Phones", desc: "Everyone joins with a code. One vote per phone, only while a question is open." },
];

export const MATH_LEVELS = [
  { id: "off", label: "Off" },
  { id: "light", label: "Light", soon: true },
  { id: "full", label: "Full", soon: true },
];

export const CHECK_LEVELS = [
  { id: "none", label: "None" },
  { id: "polls", label: "Quick polls", soon: true },
  { id: "quiz", label: "End quiz", soon: true },
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

export function saveLesson(lesson) {
  try { localStorage.setItem(KEY, JSON.stringify(lesson)); } catch { /* private mode */ }
}
