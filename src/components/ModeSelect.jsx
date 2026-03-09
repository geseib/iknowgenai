import {
  Robot,
  ChalkboardTeacher,
  GameController,
  Book,
  Exam,
} from "@phosphor-icons/react";

const modes = [
  {
    id: "classroom",
    Icon: ChalkboardTeacher,
    title: "Classroom Mode",
    desc: "You control the pace. Discussion prompts and full teacher talking points included.",
    color: "#00bbf9",
    detail: "Best for: presenting to a class",
  },
  {
    id: "solo",
    Icon: GameController,
    title: "Solo Mode",
    desc: "Students explore at their own pace with interactive quizzes guiding the way.",
    color: "#fee440",
    detail: "Best for: individual learning",
  },
];

export default function ModeSelect({ onSelect, allCss }) {
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
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 540 }}>
        <Robot size={64} weight="duotone" color="rgba(255,255,255,.7)" style={{ marginBottom: 8 }} />
        <h1 style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 42, fontWeight: 700, color: "white", marginBottom: 10, lineHeight: 1.1 }}>How AI Thinks</h1>
        <p style={{ color: "rgba(255,255,255,.5)", fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>
          An interactive lesson for 3rd &amp; 4th graders.<br />Choose how you're running this session today.
        </p>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          {modes.map(m => (
            <div key={m.id} className="mode-card" onClick={() => onSelect(m.id)}
              style={{
                width: 220, padding: "28px 20px", borderRadius: 20,
                background: `${m.color}10`, border: `2px solid ${m.color}50`,
                cursor: "pointer", textAlign: "center",
              }}>
              <m.Icon size={52} weight="duotone" color={m.color} style={{ marginBottom: 12 }} />
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 22, color: "white", marginBottom: 10 }}>{m.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.55)", lineHeight: 1.55, marginBottom: 12 }}>{m.desc}</div>
              <div style={{ fontSize: 12, color: m.color, fontFamily: "'Fredoka',sans-serif" }}>{m.detail}</div>
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

        <p style={{ color: "rgba(255,255,255,.2)", fontSize: 12, marginTop: 18 }}>13 sections &middot; ~45 minutes &middot; Ages 8&ndash;11</p>
      </div>
    </div>
  );
}
