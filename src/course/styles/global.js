// Global CSS for the v2 course. Injected by CourseApp only — never co-mounts
// with the K-8 app's ALL_CSS.

export const COURSE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

.v2, .v2 * { box-sizing: border-box; }

.v2 {
  background: #0B0E14;
  color: #E7EAF2;
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 18px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

.v2 h1, .v2 h2, .v2 h3 {
  font-family: 'Newsreader', Georgia, serif;
  font-weight: 500;
  line-height: 1.15;
  margin: 0;
  letter-spacing: -0.01em;
}

.v2 p { margin: 0; max-width: 66ch; }

.v2 button {
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  border: none;
  background: none;
  color: inherit;
}

.v2 input, .v2 textarea {
  font-family: 'Inter', sans-serif;
  font-size: 17px;
  color: #E7EAF2;
  background: #121826;
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 10px;
  padding: 12px 16px;
  outline: none;
  transition: border-color 200ms;
}
.v2 input:focus, .v2 textarea:focus { border-color: rgba(255,255,255,.3); }
.v2 input::placeholder, .v2 textarea::placeholder { color: #5C6478; }

.v2 ::selection { background: rgba(108,158,248,.3); }

/* ---- Motion vocabulary: purposeful, ease-out, no bounce ---- */
@keyframes v2FadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes v2FadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes v2GrowBar {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes v2DrawLine {
  from { stroke-dashoffset: 1; }
  to   { stroke-dashoffset: 0; }
}
@keyframes v2Pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .45; }
}
@keyframes v2Blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.v2 .reveal { animation: v2FadeUp 280ms cubic-bezier(.2,.7,.3,1) both; }
.v2 .reveal-slow { animation: v2FadeUp 500ms cubic-bezier(.2,.7,.3,1) both; }

/* Token chips (mono, quiet borders) */
.v2 .token-chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,.12);
  display: inline-block;
  animation: v2FadeUp 280ms cubic-bezier(.2,.7,.3,1) both;
  white-space: pre;
}

/* Primary + ghost buttons */
.v2 .btn {
  font-size: 16px;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 10px;
  transition: transform 200ms cubic-bezier(.2,.7,.3,1), opacity 200ms, background 200ms;
}
.v2 .btn:hover { transform: translateY(-1px); }
.v2 .btn:active { transform: translateY(0); }
.v2 .btn:disabled { opacity: .4; cursor: default; transform: none; }
.v2 .btn-ghost {
  background: transparent;
  border: 1px solid rgba(255,255,255,.15);
  color: #98A2B8;
}
.v2 .btn-ghost:hover { border-color: rgba(255,255,255,.35); color: #E7EAF2; }

/* Range sliders */
.v2 input[type=range] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  border: none;
  padding: 0;
  height: 28px;
  width: 100%;
}
.v2 input[type=range]::-webkit-slider-runnable-track {
  height: 4px; border-radius: 2px; background: rgba(255,255,255,.15);
}
.v2 input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px; height: 18px; border-radius: 50%;
  background: #E7EAF2; margin-top: -7px;
  transition: transform 200ms;
}
.v2 input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.15); }
.v2 input[type=range]::-moz-range-track {
  height: 4px; border-radius: 2px; background: rgba(255,255,255,.15);
}
.v2 input[type=range]::-moz-range-thumb {
  width: 18px; height: 18px; border-radius: 50%; border: none; background: #E7EAF2;
}

/* Thin scrollbars */
.v2 ::-webkit-scrollbar { width: 8px; height: 8px; }
.v2 ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 4px; }
.v2 ::-webkit-scrollbar-track { background: transparent; }

@media (prefers-reduced-motion: reduce) {
  .v2 *, .v2 *::before, .v2 *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Presentation mode — a speaker drives; the slide is headline + visual.
   All body prose, leads, and honest footnotes drop off the projected slide
   (the speaker delivers them from the notes panel), leaving the kicker,
   heading, and the interactive/visual. Everything scales up for a room. */
.v2 .presenting .present-hide,
.v2 .presenting .honest-note {
  display: none !important;
}
.v2 .presenting .present-stage {
  zoom: 1.18;
}
/* Fallback for engines without zoom: nudge base text up instead. */
@supports not (zoom: 1) {
  .v2 .presenting .present-stage { font-size: 1.12em; }
}
`;
