import {
  ChalkboardTeacher,
  GameController,
  Book,
  Exam,
  Flag,
  MagnifyingGlass,
  Compass,
  PaintBrush,
} from "@phosphor-icons/react";
import { GRADE_CONFIG } from "../data/gradeConfig";
import { GRADES } from "../data/GradeContext";
import { SESSION_CONFIG, SESSION_COLORS } from "../data/sessionConfig";
import RoamingCat from "./catai/cat_runner_react_component";

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

const SESSION_ICONS = [MagnifyingGlass, Compass, PaintBrush];

export default function ModeSelect({ onSelect, grade, onGradeChange, allCss, flags, session, onSessionChange }) {
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

        {/* Session selector (v3 multi-session) */}
        {flags?.multiSession && (
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
            {(SESSION_CONFIG[grade]?.sessions || []).map((s, i) => {
              const active = i === (session || 0);
              const sColor = SESSION_COLORS[i];
              const SIcon = SESSION_ICONS[i];
              return (
                <button
                  key={i}
                  onClick={() => onSessionChange?.(i)}
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 15,
                    fontWeight: active ? 700 : 500,
                    padding: "10px 20px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    background: active ? `${sColor}20` : "transparent",
                    color: active ? sColor : "rgba(255,255,255,.35)",
                    transition: "all .2s ease",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <SIcon size={20} weight={active ? "duotone" : "regular"} />
                  <div>{s.name}</div>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 400,
                    color: active ? `${sColor}99` : "rgba(255,255,255,.2)",
                    marginTop: 0,
                  }}>
                    {s.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        )}

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
        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
          <button onClick={() => onSelect("glossary")} className="ghost-btn" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, padding: "8px 16px" }}>
            <Book size={18} weight="duotone" /> Glossary
          </button>
          <button onClick={() => onSelect("quiz")} className="ghost-btn" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, padding: "8px 16px" }}>
            <Exam size={18} weight="duotone" /> Knowledge Check
          </button>
          <button onClick={() => onSelect("flags")} className="ghost-btn" style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 14, padding: "8px 16px",
            borderColor: (flags?.flowVersion || flags?.multiSession) ? "#fb560740" : "rgba(255,255,255,.12)",
            background: (flags?.flowVersion || flags?.multiSession) ? "#fb560712" : undefined,
          }}>
            <Flag size={18} weight="duotone" color={(flags?.flowVersion || flags?.multiSession) ? "#fb5607" : undefined} /> Flags
            {flags?.multiSession ? (
              <span style={{
                fontSize: 10,
                background: "#fb5607",
                color: "#000",
                borderRadius: 8,
                padding: "2px 6px",
                fontWeight: 700,
                fontFamily: "'Fredoka',sans-serif",
              }}>v3</span>
            ) : flags?.flowVersion ? (
              <span style={{
                fontSize: 10,
                background: "#fb5607",
                color: "#000",
                borderRadius: 8,
                padding: "2px 6px",
                fontWeight: 700,
                fontFamily: "'Fredoka',sans-serif",
              }}>v2</span>
            ) : null}
          </button>
        </div>

        <p style={{ color: "rgba(255,255,255,.2)", fontSize: 12, marginTop: 18 }}>
          {activeSections} sections &middot; {totalSlides} slides &middot; {gc.duration} &middot; {gc.label}
        </p>

        {/* The 14+ course — styled deliberately unlike the kids' app */}
        <a
          href="/course"
          style={{
            display: "inline-block",
            marginTop: 28,
            padding: "14px 22px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.14)",
            background: "#0B0E14",
            textDecoration: "none",
            textAlign: "left",
            maxWidth: 520,
          }}
        >
          <span style={{
            display: "block", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
            color: "#6C9EF8", fontWeight: 600, marginBottom: 4,
          }}>
            Ages 14+ &middot; teens &amp; adults
          </span>
          <span style={{ display: "block", fontFamily: "Georgia, serif", fontSize: 19, color: "#E7EAF2" }}>
            How AI Actually Works →
          </span>
          <span style={{ display: "block", fontSize: 13, color: "rgba(231,234,242,.55)", marginTop: 4, lineHeight: 1.5 }}>
            A deeper 14-chapter course on what's under the hood — live demos, real models, no simulations.
          </span>
        </a>

      </div>
      {flags?.roamingCat && <RoamingCat />}
    </div>
  );
}
