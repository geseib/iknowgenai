// Shared primitives for the 3b1b-style sidequest rebuilds — the machinery of
// docs/SIDEQUEST-PEDAGOGY.md, built once so every quest inherits it:
//
//   PredictGate — the commit-before-you-drag pill row ("FIRST — CALL IT").
//   CalledIt    — outcome-copy prefix that threads the guess back in.
//   GateLock    — dims and disables a demo until its gate is committed.
//   MathDoor    — the optional-symbols disclosure ("SHOW ME THE ACTUAL MATH").
//   FogMask     — an SVG mask that hides everything except a headlamp circle
//                 around a focal point (the "model never sees the map" visual).
//
// These are quest furniture, not course furniture — chapters keep building
// from ui/shared.jsx; sidequests build from both.
import { useId, useState } from "react";
import { FONTS, COLORS, SPACE, MOTION } from "../styles/theme.js";
import { Prose } from "./shared.jsx";

// ---- PredictGate ------------------------------------------------------------
// A cheap, two-tap commitment above a demo. Fully controlled: the parent owns
// `guess` (null until committed) and receives `onCommit(id)`. Children render
// only after commit — put the outcome copy there (usually a <CalledIt>). Pair
// with <GateLock locked={guess == null}> around the demo itself.
//
// Optional resolution props: once the demo has actually answered the question,
// set `resolved` and pass `correct` (an option id). The correct pill lights up
// green (with a ✓) and a wrong pick is marked red (with a ✗) — the answer is
// called out on the pills themselves, not only in the outcome copy.
export function PredictGate({ accent, question, options, guess, onCommit, correct, resolved = false, children }) {
  const committed = guess != null;
  const showAnswer = resolved && correct != null;
  return (
    <div
      style={{
        border: `1px dashed ${accent}55`,
        borderRadius: 12,
        padding: SPACE.sm,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <span
        style={{
          fontFamily: FONTS.mono, fontSize: 11, fontWeight: 600,
          letterSpacing: "0.14em", color: accent,
        }}
      >
        FIRST — CALL IT
      </span>
      <Prose style={{ fontSize: 15 }}>{question}</Prose>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {options.map((o) => {
          const chosen = guess === o.id;
          const isAnswer = showAnswer && o.id === correct;
          const isMiss = showAnswer && chosen && o.id !== correct;
          const borderColor = isAnswer ? COLORS.correct : isMiss ? COLORS.wrong : chosen ? accent : COLORS.hairline;
          const bg = isAnswer ? `${COLORS.correct}22` : isMiss ? `${COLORS.wrong}22` : chosen ? `${accent}22` : "transparent";
          return (
            <button
              key={o.id}
              onClick={() => { if (!committed) onCommit(o.id); }}
              disabled={committed && !chosen}
              style={{
                fontFamily: FONTS.mono, fontSize: 13, padding: "8px 14px",
                borderRadius: 999, cursor: committed ? "default" : "pointer",
                border: `1px solid ${borderColor}`,
                background: bg,
                color: isAnswer || isMiss || chosen ? COLORS.text : committed ? COLORS.faint : COLORS.muted,
                transition: `all ${MOTION.fast}`,
              }}
            >
              {isAnswer && <span style={{ color: COLORS.correct, marginRight: 6 }}>✓</span>}
              {isMiss && <span style={{ color: COLORS.wrong, marginRight: 6 }}>✗</span>}
              {o.label}
            </button>
          );
        })}
      </div>
      {committed && children}
    </div>
  );
}

// Outcome-copy prefix. `hit` = the learner's guess matched what the demo
// showed. Being wrong is worded as the fun path — give the miss copy the
// more interesting explanation.
export function CalledIt({ hit, children }) {
  return (
    <Prose className="reveal" style={{ fontSize: 15 }}>
      <strong style={{ color: hit ? COLORS.correct : COLORS.wrong }}>
        {hit ? "You called it. " : "Surprise — "}
      </strong>
      {children}
    </Prose>
  );
}

// ---- GateLock ---------------------------------------------------------------
// Wrap the demo. While locked, it's visible but inert — the reveal controls
// exist, greyed, exactly as the blueprint specifies.
export function GateLock({ locked, label = "CALL IT ABOVE TO UNLOCK", children }) {
  return (
    <div style={{ position: "relative" }}>
      <div
        aria-hidden={locked || undefined}
        style={{
          opacity: locked ? 0.3 : 1,
          filter: locked ? "grayscale(70%)" : "none",
          pointerEvents: locked ? "none" : "auto",
          transition: `opacity ${MOTION.slow} ${MOTION.ease}, filter ${MOTION.slow} ${MOTION.ease}`,
        }}
      >
        {children}
      </div>
      {locked && (
        <div
          style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center", pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono, fontSize: 11, fontWeight: 600,
              letterSpacing: "0.14em", color: COLORS.muted,
              background: "rgba(11,14,20,.75)", border: `1px solid ${COLORS.hairline}`,
              borderRadius: 8, padding: "6px 12px",
            }}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

// ---- MathDoor ---------------------------------------------------------------
// The optional-symbols disclosure. Collapsed by default; the main flow must
// read complete without ever opening one. `reassure` renders the standing
// reassurance line (use it on the FIRST door of each quest, per blueprint
// §A4 beat 1) — visible without opening the door.
const REASSURANCE =
  "Everything behind these doors is optional. If you skip every one of " +
  "them, you still get the whole idea — they exist for the day you're curious.";

export function MathDoor({ accent, reassure = false, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button
        className="btn btn-ghost"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          alignSelf: "flex-start", fontFamily: FONTS.mono, fontSize: 12,
          letterSpacing: "0.08em",
        }}
      >
        <span style={{ color: accent, marginRight: 8 }}>{open ? "▾" : "▸"}</span>
        SHOW ME THE ACTUAL MATH
        <span style={{ color: COLORS.faint, marginLeft: 8, letterSpacing: 0 }}>· optional</span>
      </button>
      {reassure && (
        <span style={{ fontSize: 13, lineHeight: 1.6, color: COLORS.faint, maxWidth: "58ch" }}>
          {REASSURANCE}
        </span>
      )}
      {open && (
        <div
          className="reveal"
          style={{
            border: `1px solid ${COLORS.hairline}`, borderRadius: 12,
            padding: SPACE.sm, display: "flex", flexDirection: "column", gap: 12,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ---- FogMask ----------------------------------------------------------------
// SVG defs for the "headlamp in the fog" visual: everything rendered inside
// <g mask={fogMaskUrl}> is invisible except (a) a faint ambient level and
// (b) a soft circle of light around (cx, cy). Lifting the fog fades the whole
// scene in — a single continuous morph, no cuts. Usage:
//
//   const fog = useFogMask({ lifted, cx, cy, r: 95, ambient: 0.07 });
//   <svg>
//     <defs>{fog.defs}</defs>
//     <g mask={fog.maskUrl}>{...the terrain the model can't see...}</g>
//   </svg>
// A hook, not a component; it lives beside the gate/door primitives on
// purpose so every quest imports one file. Fast refresh falls back to a
// full reload for this module, which is fine.
// eslint-disable-next-line react-refresh/only-export-components
export function useFogMask({ lifted, cx, cy, r = 95, ambient = 0.07 }) {
  const uid = useId().replace(/:/g, "");
  const lampId = `lamp-${uid}`;
  const maskId = `fogmask-${uid}`;
  const defs = (
    <>
      <radialGradient id={lampId}>
        <stop offset="0%" stopColor="#fff" stopOpacity="1" />
        <stop offset="55%" stopColor="#fff" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <mask id={maskId}>
        <rect
          x="-2000" y="-2000" width="4000" height="4000" fill="#fff"
          style={{ opacity: lifted ? 1 : ambient, transition: `opacity ${MOTION.slow} ${MOTION.ease}` }}
        />
        <g
          style={{
            transform: `translate(${cx}px, ${cy}px)`,
            transition: `transform ${MOTION.base} ${MOTION.ease}`,
            opacity: lifted ? 0 : 1,
          }}
        >
          <circle r={r} fill={`url(#${lampId})`} />
        </g>
      </mask>
    </>
  );
  return { defs, maskUrl: `url(#${maskId})` };
}
