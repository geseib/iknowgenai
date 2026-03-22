import {
  ChalkboardTeacher,
  GameController,
  Book,
  Exam,
  Shuffle,
} from "@phosphor-icons/react";
import { GRADE_CONFIG } from "../data/gradeConfig";
import { GRADES } from "../data/GradeContext";

const modes = [
  {
    id: "student",
    Icon: GameController,
    title: "Student Mode",
    desc: "Explore at your own pace with big, bold slides and full animations.",
    color: "#fee440",
    detail: "Best for: solo exploration or projecting to a room",
  },
  {
    id: "teacher",
    Icon: ChalkboardTeacher,
    title: "Teacher Mode",
    desc: "Same experience plus a slide-out panel with talking points, key definitions, and discussion prompts.",
    color: "#00bbf9",
    detail: "Best for: presenting to a class",
  },
];

export default function ModeSelect({ onSelect, grade, onGradeChange, allCss, flowVersion, onFlowChange }) {
  const gc = GRADE_CONFIG[grade];
  const totalSlides = gc.presentationSlides.reduce((a, b) => a + b, 0);
  const activeSections = gc.presentationSlides.filter(n => n > 0).length;

  const stars = Array.from({ length: 60 }, (_, i) => ({
    x: ((i * 137.508) % 100).toFixed(1),
    y: ((i * 73.214) % 100).toFixed(1),
    s: (0.5 + (i % 5) * .35).toFixed(1),
    d: (1.2 + (i % 5) * .6).toFixed(1),
    dl: ((i % 30) * .1).toFixed(1),
  }));

  return (
    <div style={{
      minHeight: "100vh", background: "#050512",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 32, position: "relative", overflow: "hidden",
    }}>
      {allCss && <style>{allCss}</style>}
      {stars.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.s}px`, height: `${s.s}px`, borderRadius: "50%",
          background: "white",
          animation: `twinkle ${s.d}s ${s.dl}s infinite alternate`,
          pointerEvents: "none",
        }} />
      ))}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 580 }}>
        <img src={`${import.meta.env.BASE_URL}robotcomputerbrain.png`} alt="AI mascot" style={{ width: 100, height: "auto", marginBottom: 8, opacity: 0.85 }} />
        <h1 style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 42, fontWeight: 700, color: "white", marginBottom: 6, lineHeight: 1.1 }}>How AI Thinks</h1>
        <p style={{ color: "rgba(255,255,255,.45)", fontSize: 15, marginBottom: 24, lineHeight: 1.5 }}>
          {gc.subtitle}
        </p>

        {/* Grade selector */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 0,
          marginBottom: 32,
          background: "rgba(255,255,255,.06)",
          borderRadius: 14,
          padding: 4,
          border: "1px solid rgba(255,255,255,.1)",
        }}>
          {GRADES.map(g => {
            const active = g === grade;
            const cfg = GRADE_CONFIG[g];
            return (
              <button
                key={g}
                onClick={() => onGradeChange(g)}
                style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 16,
                  fontWeight: active ? 700 : 500,
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background: active ? "rgba(255,255,255,.12)" : "transparent",
                  color: active ? "white" : "rgba(255,255,255,.35)",
                  transition: "all .2s ease",
                  flex: 1,
                }}
              >
                <div>{g}</div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 400,
                  color: active ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.2)",
                  marginTop: 2,
                }}>
                  {cfg.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Mode cards */}
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          {modes.map(m => (
            <div key={m.id} className="mode-card" onClick={() => onSelect(m.id)}
              style={{
                width: 240, padding: "32px 24px", borderRadius: 20,
                background: `${m.color}10`, border: `2px solid ${m.color}50`,
                cursor: "pointer", textAlign: "center",
              }}>
              <m.Icon size={56} weight="duotone" color={m.color} style={{ marginBottom: 14 }} />
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 24, color: "white", marginBottom: 12 }}>{m.title}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,.55)", lineHeight: 1.55, marginBottom: 14 }}>{m.desc}</div>
              <div style={{ fontSize: 13, color: m.color, fontFamily: "'Fredoka',sans-serif" }}>{m.detail}</div>
            </div>
          ))}
        </div>

        {/* Resource buttons */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 28 }}>
          <button onClick={() => onSelect("glossary")} className="ghost-btn" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, padding: "8px 16px" }}>
            <Book size={18} weight="duotone" /> Glossary
          </button>
          <button onClick={() => onSelect("quiz")} className="ghost-btn" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, padding: "8px 16px" }}>
            <Exam size={18} weight="duotone" /> Knowledge Check
          </button>
        </div>

        {/* Flow version toggle */}
        {onFlowChange && (
          <div style={{ marginTop: 24 }}>
            <button
              onClick={() => onFlowChange(flowVersion === "v2" ? "v1" : "v2")}
              className="ghost-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                padding: "10px 20px",
                margin: "0 auto",
                borderColor: flowVersion === "v2" ? "#9b5de540" : "rgba(255,255,255,.12)",
                background: flowVersion === "v2" ? "#9b5de515" : "rgba(255,255,255,.07)",
              }}
            >
              <Shuffle size={18} weight="duotone" color={flowVersion === "v2" ? "#9b5de5" : "rgba(255,255,255,.5)"} />
              {flowVersion === "v2" ? "Proposed Flow (v2)" : "Current Flow (v1)"}
            </button>
            {flowVersion === "v2" && (
              <div style={{
                fontSize: 12,
                color: "#9b5de5",
                marginTop: 8,
                lineHeight: 1.5,
              }}>
                Preview: reorganized groups and section order
              </div>
            )}
          </div>
        )}

        <p style={{ color: "rgba(255,255,255,.2)", fontSize: 12, marginTop: 18 }}>
          {activeSections} sections &middot; {totalSlides} slides &middot; {gc.duration} &middot; {gc.label}
        </p>
      </div>
    </div>
  );
}
