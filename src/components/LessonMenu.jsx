// "Build your lesson" — the four rows from the course review: Level, Math, Checks,
// Interaction. Level is the existing grade toggle (rendered by the caller); this
// component renders the other three. Math and Checks are placeholders until their
// phases ship; Interaction is live and drives the lesson room.

import { INTERACTION_MODES, MATH_LEVELS, CHECK_LEVELS } from "../data/lesson";

const FONT = "'Fredoka',sans-serif";

function Row({ label, hint, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(96px, 130px) 1fr", gap: 12, alignItems: "center", padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,.04)" }}>
      <div style={{ textAlign: "left" }}>
        <div style={{ fontFamily: FONT, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,.45)" }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: "rgba(255,255,255,.28)", marginTop: 2 }}>{hint}</div>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "flex-start" }}>{children}</div>
    </div>
  );
}

function Pill({ on, soon, color, onClick, children, title }) {
  return (
    <button
      onClick={soon ? undefined : onClick}
      disabled={soon}
      title={title}
      style={{
        fontFamily: FONT, fontSize: 13, fontWeight: on ? 700 : 500, padding: "6px 12px", borderRadius: 999,
        border: `1.5px solid ${on ? color : "rgba(255,255,255,.14)"}`,
        background: on ? `${color}1f` : "transparent",
        color: soon ? "rgba(255,255,255,.22)" : on ? "white" : "rgba(255,255,255,.55)",
        cursor: soon ? "default" : "pointer", whiteSpace: "nowrap", transition: "all .2s ease",
        display: "inline-flex", alignItems: "center", gap: 6,
      }}
    >
      {children}
      {soon && <span style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", opacity: .8 }}>soon</span>}
    </button>
  );
}

export default function LessonMenu({ lesson, onChange, compact = false }) {
  const set = (k, v) => onChange({ ...lesson, [k]: v });
  const current = INTERACTION_MODES.find(m => m.id === lesson.interaction);
  const mathMeta = MATH_LEVELS.find(m => m.id === lesson.math);
  const checksMeta = CHECK_LEVELS.find(m => m.id === lesson.checks);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Row label="Interaction" hint={compact ? null : "what's in the room"}>
        {INTERACTION_MODES.map(m => (
          <Pill key={m.id} on={lesson.interaction === m.id} color="#00bbf9" onClick={() => set("interaction", m.id)} title={m.desc}>{m.label}</Pill>
        ))}
      </Row>
      {!compact && current && (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.38)", textAlign: "left", padding: "0 12px", lineHeight: 1.5 }}>{current.desc}</div>
      )}
      {!compact && (
        <>
          <Row label="Math" hint="teach some along the way">
            {MATH_LEVELS.map(m => <Pill key={m.id} on={lesson.math === m.id} soon={m.soon} color="#fee440" onClick={() => set("math", m.id)} title={m.desc}>{m.label}</Pill>)}
          </Row>
          {mathMeta?.desc && (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.38)", textAlign: "left", padding: "0 12px", lineHeight: 1.5 }}>{mathMeta.desc}</div>
          )}
          <Row label="Checks" hint="see if it landed">
            {CHECK_LEVELS.map(m => <Pill key={m.id} on={lesson.checks === m.id} soon={m.soon} color="#f15bb5" onClick={() => set("checks", m.id)} title={m.desc}>{m.label}</Pill>)}
          </Row>
          {checksMeta?.desc && (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.38)", textAlign: "left", padding: "0 12px", lineHeight: 1.5 }}>{checksMeta.desc}</div>
          )}
        </>
      )}
    </div>
  );
}
