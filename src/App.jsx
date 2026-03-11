import { useState, useEffect, useCallback } from "react";
import { Robot, ChalkboardTeacher, GameController, Eye, ArrowCounterClockwise, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import { ALL_CSS } from "./styles/global";
import { COLORS, TOTAL, GROUPS, TITLES } from "./data/constants";

import ModeSelect from "./components/ModeSelect";
import Glossary from "./components/Glossary";
import KnowledgeCheck from "./components/KnowledgeCheck";
import SectionWhoIsHere from "./components/SectionWhoIsHere";
import SectionWhatIsAI from "./components/SectionWhatIsAI";
import SectionProgramsVsAI from "./components/SectionProgramsVsAI";
import SectionBrainVsAI from "./components/SectionBrainVsAI";
import SectionWhatIsLLM from "./components/SectionWhatIsLLM";
import SectionMeetModels from "./components/SectionMeetModels";
import SectionTheBridge from "./components/SectionTheBridge";
import SectionHook from "./components/SectionHook";
import SectionEmbeddings from "./components/SectionEmbeddings";
import SectionAttention from "./components/SectionAttention";
import SectionMLP from "./components/SectionMLP";
import SectionLayers from "./components/SectionLayers";
import SectionPredict from "./components/SectionPredict";

const SECTIONS = [
  SectionWhoIsHere,
  SectionWhatIsAI,
  SectionProgramsVsAI,
  SectionBrainVsAI,
  SectionWhatIsLLM,
  SectionMeetModels,
  SectionTheBridge,
  SectionHook,
  SectionEmbeddings,
  SectionAttention,
  SectionMLP,
  SectionLayers,
  SectionPredict,
];

// Custom event for sections to signal they're fully revealed
const SECTION_DONE_EVENT = "sectionFullyRevealed";

export default function App() {
  const [mode, setMode] = useState(null);
  const [sec, setSec] = useState(0);
  const [done, setDone] = useState(new Set());

  const next = useCallback(() => {
    setDone(p => new Set([...p, sec]));
    setSec(s => Math.min(s + 1, TOTAL - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sec]);

  const prev = useCallback(() => {
    setSec(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Keyboard navigation: arrow keys to move between sections
  useEffect(() => {
    if (!mode) return;
    const handleKey = (e) => {
      // Don't capture if user is in an input/textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mode, next, prev]);

  // Listen for sections signaling they're fully revealed — next ArrowDown goes to next section
  useEffect(() => {
    if (!mode) return;
    const handleDone = () => next();
    window.addEventListener(SECTION_DONE_EVENT, handleDone);
    return () => window.removeEventListener(SECTION_DONE_EVENT, handleDone);
  }, [mode, next]);

  if (!mode) return <ModeSelect onSelect={setMode} allCss={ALL_CSS} />;
  if (mode === "glossary") return <><style>{ALL_CSS}</style><Glossary onBack={() => setMode(null)} /></>;
  if (mode === "quiz") return <><style>{ALL_CSS}</style><KnowledgeCheck onBack={() => setMode(null)} /></>;

  const color = COLORS[sec % COLORS.length];
  const currentGroup = GROUPS.find(g => sec >= g.start && sec <= g.end);
  const progressPct = Math.round(((sec + 1) / TOTAL) * 100);

  const stars = Array.from({ length: 80 }, (_, i) => ({
    x: ((i * 137.508) % 100).toFixed(2),
    y: ((i * 73.214) % 100).toFixed(2),
    s: (0.5 + (i % 5) * .35).toFixed(1),
    d: (1.2 + (i % 5) * .6).toFixed(1),
    dl: ((i % 30) * .1).toFixed(1),
  }));

  const SectionComponent = SECTIONS[sec];

  const isMinimal = mode === "minimal";

  return (
    <div style={{ minHeight: "100vh", background: "#050512", color: "white", fontFamily: "'Nunito',sans-serif", position: "relative" }}>
      <style>{ALL_CSS}</style>

      {/* Starfield — hidden in minimal */}
      {!isMinimal && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          {stars.map((s, i) => (
            <div key={i} style={{
              position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
              width: `${s.s}px`, height: `${s.s}px`, borderRadius: "50%", background: "white",
              animation: `twinkle ${s.d}s ${s.dl}s infinite alternate`,
            }} />
          ))}
        </div>
      )}

      {/* Ambient blob — hidden in minimal */}
      {!isMinimal && (
        <div style={{
          position: "fixed", top: "25%", right: "-15%", width: "55vw", height: "55vw",
          borderRadius: "50%", background: `radial-gradient(circle,${color}14 0%,transparent 65%)`,
          pointerEvents: "none", transition: "background .7s ease",
          animation: "blobPulse 5s ease-in-out infinite", zIndex: 1,
        }} />
      )}

      {/* Header — minimal: just progress bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: isMinimal ? "transparent" : "rgba(5,5,18,.88)",
        backdropFilter: isMinimal ? "none" : "blur(12px)",
        borderBottom: isMinimal ? "none" : "1px solid rgba(255,255,255,.06)",
      }}>
        <div style={{ height: isMinimal ? 2 : 3, background: "rgba(255,255,255,.08)" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: isMinimal ? "rgba(255,255,255,.25)" : color, transition: "width .5s ease", borderRadius: "0 2px 2px 0" }} />
        </div>
        {!isMinimal && (
          <div style={{ padding: "10px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <Robot size={20} weight="duotone" color={color} />
                <span style={{ color }}>How AI Thinks</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontFamily: "'Fredoka',sans-serif", marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
                {mode === "classroom"
                  ? <><ChalkboardTeacher size={12} weight="duotone" /> Classroom</>
                  : <><GameController size={12} weight="duotone" /> Solo</>}
                {" · "}{currentGroup?.name}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 13, color: "rgba(255,255,255,.35)" }}>{sec + 1} / {TOTAL}</div>
              <div style={{ fontSize: 11, color: `${color}88`, fontFamily: "'Fredoka',sans-serif", marginTop: 1 }}>{progressPct}% complete</div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: isMinimal ? "32px 28px 72px" : "88px 28px 96px", position: "relative", zIndex: 10 }} key={sec}>
        <SectionComponent color={color} mode={mode} />
      </div>

      {/* Footer nav — minimal: just arrows, no title */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, padding: "13px 22px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: isMinimal ? "transparent" : "rgba(5,5,18,.9)",
        backdropFilter: isMinimal ? "none" : "blur(12px)",
        borderTop: isMinimal ? "none" : "1px solid rgba(255,255,255,.06)", zIndex: 100,
      }}>
        <button onClick={prev} disabled={sec === 0} className="ghost-btn" style={isMinimal ? { opacity: sec === 0 ? 0.2 : 0.5 } : {}}>
          <ArrowLeft size={18} weight="bold" /> {!isMinimal && "Back"}
        </button>
        {!isMinimal && (
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 13, color: "rgba(255,255,255,.38)", textAlign: "center", maxWidth: 200, lineHeight: 1.3 }}>
            {TITLES[sec]}
          </div>
        )}
        {sec < TOTAL - 1
          ? <button onClick={next} className={isMinimal ? "ghost-btn" : "cta-btn"} style={isMinimal ? { opacity: 0.5 } : { background: color, color: "#000" }}>
              {!isMinimal && "Next"} <ArrowRight size={18} weight="bold" />
            </button>
          : <button onClick={() => { setSec(0); setDone(new Set()); window.scrollTo({ top: 0 }); }} className={isMinimal ? "ghost-btn" : "cta-btn"} style={isMinimal ? { opacity: 0.5 } : { background: color, color: "#000", display: "flex", alignItems: "center", gap: 6 }}>
              <ArrowCounterClockwise size={18} weight="bold" /> {!isMinimal && "Restart"}
            </button>
        }
      </div>
    </div>
  );
}
