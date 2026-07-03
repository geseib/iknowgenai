// Design tokens for the v2 course — "How AI Actually Works"
// A quieter, more grown-up identity than the K-8 app. Lecture-hall-at-night:
// near-black canvas, restrained accents, serif display type.

export const FONTS = {
  display: "'Newsreader', Georgia, serif",
  body: "'Inter', -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

export const COLORS = {
  bg: "#0B0E14",
  surface: "#121826",
  surfaceRaised: "#1A2233",
  hairline: "rgba(255,255,255,.08)",
  text: "#E7EAF2",
  muted: "#98A2B8",
  faint: "#5C6478",
  correct: "#7BC97B",
  wrong: "#E06C75",
};

// One accent per act. Chrome stays monochrome; the data gets the color.
export const ACT_ACCENTS = {
  1: "#6C9EF8", // blue — The Mystery
  2: "#4FD6BE", // teal — Learning Without Rules
  3: "#A78BFA", // violet — Inside the Machine
  4: "#E5B567", // amber — The Roll of the Dice
  5: "#E58FB1", // rose — Powers and Limits
};

// 1.25 modular scale off an 18px body
export const TYPE = {
  caption: 15,
  body: 18,
  lead: 23,
  h3: 29,
  h2: 36,
  h1: 45,
  hero: 56,
};

export const SPACE = { xs: 8, sm: 16, md: 24, lg: 40, xl: 64 };

export const MOTION = {
  fast: "200ms",
  base: "280ms",
  slow: "500ms",
  ease: "cubic-bezier(.2,.7,.3,1)",
};

export const MOBILE_BREAK = 768;
