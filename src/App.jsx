import { useState } from "react";
import { Robot, ChalkboardTeacher, GameController, ArrowCounterClockwise } from "@phosphor-icons/react";
import { ALL_CSS } from "./styles/global";
import { COLORS, TOTAL, GROUPS, TITLES } from "./data/constants";

import ModeSelect from "./components/ModeSelect";
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

export default function App() {
  const [mode, setMode] = useState(null);
  const [sec, setSec] = useState(0);
  const [done, setDone] = useState(new Set());

  if (!mode) return <ModeSelect onSelect={setMode} allCss={ALL_CSS} />;

  const color = COLORS[sec % COLORS.length];
  const next = () => { setDone(p => new Set([...p, sec])); setSec(s => Math.min(s + 1, TOTAL - 1)); };
  const prev = () => setSec(s => Math.max(s - 1, 0));
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

  return (
    <div style={{ minHeight: "100vh", background: "#050512", color: "white", fontFamily: "'Nunito',sans-serif", position: "relative" }}>
      <style>{ALL_CSS}</style>

      {/* Starfield */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {stars.map((s, i) => (
          <div key={i} style={{
            position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
            width: `${s.s}px`, height: `${s.s}px`, borderRadius: "50%", background: "white",
            animation: `twinkle ${s.d}s ${s.dl}s infinite alternate`,
          }} />
        ))}
      </div>

      {/* Ambient blob */}
      <div style={{
        position: "fixed", top: "25%", right: "-15%", width: "55vw", height: "55vw",
        borderRadius: "50%", background: `radial-gradient(circle,${color}14 0%,transparent 65%)`,
        pointerEvents: "none", transition: "background .7s ease",
        animation: "blobPulse 5s ease-in-out infinite", zIndex: 1,
      }} />

      {/* Header */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(5,5,18,.88)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}>
        <div style={{ height: 3, background: "rgba(255,255,255,.08)" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: color, transition: "width .5s ease", borderRadius: "0 2px 2px 0" }} />
        </div>
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
              {" \u00b7 "}{currentGroup?.name}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 13, color: "rgba(255,255,255,.35)" }}>{sec + 1} / {TOTAL}</div>
            <div style={{ fontSize: 11, color: `${color}88`, fontFamily: "'Fredoka',sans-serif", marginTop: 1 }}>{progressPct}% complete</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "88px 22px 96px", position: "relative", zIndex: 10 }} key={sec}>
        <SectionComponent color={color} mode={mode} />
      </div>

      {/* Footer nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, padding: "13px 22px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(5,5,18,.9)", backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,.06)", zIndex: 100,
      }}>
        <button onClick={prev} disabled={sec === 0} className="ghost-btn">&larr; Back</button>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 13, color: "rgba(255,255,255,.38)", textAlign: "center", maxWidth: 200, lineHeight: 1.3 }}>
          {TITLES[sec]}
        </div>
        {sec < TOTAL - 1
          ? <button onClick={next} className="cta-btn" style={{ background: color, color: "#000" }}>Next &rarr;</button>
          : <button onClick={() => { setSec(0); setDone(new Set()); }} className="cta-btn" style={{ background: color, color: "#000", display: "flex", alignItems: "center", gap: 6 }}>
              <ArrowCounterClockwise size={18} weight="bold" /> Restart
            </button>
        }
      </div>
    </div>
  );
}
