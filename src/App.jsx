import { useState, useEffect, useCallback } from "react";
import { Robot, ChalkboardTeacher, GameController, Eye, ArrowCounterClockwise, ArrowRight, ArrowLeft, FastForward, List, CaretLeft, CheckCircle } from "@phosphor-icons/react";
import { ALL_CSS } from "./styles/global";
import { COLORS, TOTAL, GROUPS, TITLES } from "./data/constants";
import { TEACHER_NOTES } from "./data/teacherNotes";
import TeacherDrawer from "./components/TeacherDrawer";

import ModeSelect from "./components/ModeSelect";
import Glossary from "./components/Glossary";
import KnowledgeCheck from "./components/KnowledgeCheck";
import SectionWhoIsHere from "./components/SectionWhoIsHere";
import SectionWhatIsAI from "./components/SectionWhatIsAI";
import SectionProgramsVsAI from "./components/SectionProgramsVsAI";
import SectionHowItLearns from "./components/SectionHowItLearns";
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
  SectionHowItLearns,
  SectionHook,
  SectionEmbeddings,
  SectionAttention,
  SectionMLP,
  SectionLayers,
  SectionPredict,
];

// How many presentation slides each section has (used only in presentation mode)
// Sections export this or we define it here for coordination
const PRESENTATION_SLIDES = [
  3,  // SectionWhoIsHere: question → grid → insight
  5,  // SectionWhatIsAI: question → robot → program → brain → real answer
  8,  // SectionProgramsVsAI: question → pair1 → reveal1 → pair2 → reveal2 → pair3 → reveal3 → insight
  16, // SectionBrainVsAI: intro → 7 comparisons (question → reveal each) → insight
  5,  // SectionWhatIsLLM: LLM boxes → L → L → M + insight → not just text
  4,  // SectionMeetModels: ChatGPT → Claude → Llama+Gemini → takeaway
  3,  // SectionTheBridge: training overview → animated pipeline → punchline
  11, // SectionHowItLearns: knock knock → lettuce → punchline → robots intro → R1 question → R1 answer → R2 question → R2 answer → R3 question → R3 answer → insight
  5,  // SectionHook: "how does AI read a word?" → cat word → feelings → numbers reveal → ticker
  8,  // SectionEmbeddings: dimensions → scatter → neighbourhoods → animal → bird+plane → has wings → rideable → all dimensions
  7,  // SectionAttention: bat reveal → both meanings → AI sees both + unless → words look around → sentence 1 → sentence 2 → insight
  4,  // SectionMLP: intro → expand (brainstorm) → compress (pick best) → analogy
  2,  // SectionLayers: 96 times → animation
  5,  // SectionPredict: how did it pick? → meaning load anim → probability list → playground → celebration
];

// Sections with a "skip to takeaway" button — maps section index → takeaway slide
const PRESENTATION_SKIP = {
  2: 7,   // SectionProgramsVsAI → insight slide
  3: 15,  // SectionBrainVsAI → insight slide
};

// Custom event for sections to signal they're fully revealed
const SECTION_DONE_EVENT = "sectionFullyRevealed";

export default function App() {
  const [mode, setMode] = useState(null);
  const [sec, setSec] = useState(0);
  const [slide, setSlide] = useState(0); // presentation mode: which slide within section
  const [done, setDone] = useState(new Set());
  const [navOpen, setNavOpen] = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(false);

  const isTeacherMode = mode === "teacher";
  // Both student and teacher modes use presentation-style rendering
  const isPres = mode === "student" || mode === "teacher";

  // Open teacher drawer automatically when entering teacher mode
  useEffect(() => {
    if (mode === "teacher") setTeacherOpen(true);
  }, [mode]);

  const jumpToSection = useCallback((targetSec) => {
    setSec(targetSec);
    setSlide(0);
    setNavOpen(false);
  }, []);

  const next = useCallback(() => {
    const maxSlides = PRESENTATION_SLIDES[sec] || 1;
    if (slide < maxSlides - 1) {
      setSlide(s => s + 1);
      return;
    }
    if (sec < TOTAL - 1) {
      setDone(p => new Set([...p, sec]));
      let nextSec = sec + 1;
      while (nextSec < TOTAL - 1 && PRESENTATION_SLIDES[nextSec] === 0) {
        setDone(p => new Set([...p, nextSec]));
        nextSec++;
      }
      setSec(nextSec);
      setSlide(0);
    }
  }, [sec, slide]);

  const prev = useCallback(() => {
    if (slide > 0) {
      setSlide(s => s - 1);
      return;
    }
    if (sec > 0) {
      let prevSec = sec - 1;
      while (prevSec > 0 && PRESENTATION_SLIDES[prevSec] === 0) {
        prevSec--;
      }
      setSec(prevSec);
      setSlide((PRESENTATION_SLIDES[prevSec] || 1) - 1);
    }
  }, [sec, slide]);

  // Keyboard navigation
  useEffect(() => {
    if (!mode) return;
    const handleKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      // Escape closes any open drawer
      if (e.key === "Escape") {
        if (navOpen) { setNavOpen(false); return; }
        if (teacherOpen) { setTeacherOpen(false); return; }
      }
      // T toggles teacher drawer
      if (e.key === "t" || e.key === "T") { setTeacherOpen(o => !o); return; }
      // Suppress navigation while a drawer is open
      if (navOpen || teacherOpen) return;
      // Right, Down, Space advance; Left goes back
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mode, next, prev, navOpen, teacherOpen]);

  if (!mode) return <ModeSelect onSelect={setMode} allCss={ALL_CSS} />;
  if (mode === "glossary") return <><style>{ALL_CSS}</style><Glossary onBack={() => setMode(null)} /></>;
  if (mode === "quiz") return <><style>{ALL_CSS}</style><KnowledgeCheck onBack={() => setMode(null)} /></>;

  const color = COLORS[sec % COLORS.length];
  const currentGroup = GROUPS.find(g => sec >= g.start && sec <= g.end);

  // Progress — always slide-based
  const totalSlideCount = PRESENTATION_SLIDES.reduce((a, b) => a + b, 0);
  const currentSlideNum = PRESENTATION_SLIDES.slice(0, sec).reduce((a, b) => a + b, 0) + slide + 1;
  const progressPct = Math.round((currentSlideNum / totalSlideCount) * 100);

  // Teacher notes for current slide
  const currentNotes = TEACHER_NOTES[sec]?.slides?.[slide] || {};

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
      {(
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

      {/* Ambient blob */}
      {(
        <div style={{
          position: "fixed", top: "25%", right: "-15%", width: "55vw", height: "55vw",
          borderRadius: "50%", background: `radial-gradient(circle,${color}14 0%,transparent 65%)`,
          pointerEvents: "none", transition: "background .7s ease",
          animation: "blobPulse 5s ease-in-out infinite", zIndex: 1,
        }} />
      )}

      {/* ── Nav Drawer ── */}
      {(
        <>
          {/* Backdrop */}
          <div
            onClick={() => setNavOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 140,
              background: "rgba(5,5,18,.55)",
              backdropFilter: "blur(3px)",
              opacity: navOpen ? 1 : 0,
              pointerEvents: navOpen ? "auto" : "none",
              transition: "opacity .25s ease",
            }}
          />

          {/* Sliding container: drawer + toggle tab move together */}
          <div style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            zIndex: 145,
            width: 312,
            maxWidth: "calc(85vw + 32px)",
            transform: navOpen ? "translateX(0)" : "translateX(-280px)",
            transition: "transform .3s cubic-bezier(.4,0,.2,1)",
            display: "flex",
            pointerEvents: "none",
          }}>
            {/* Drawer panel */}
            <div style={{
              width: 280,
              flexShrink: 0,
              height: "100%",
              background: "rgba(10,10,28,.95)",
              backdropFilter: "blur(16px)",
              borderRight: `1px solid rgba(255,255,255,.08)`,
              boxShadow: navOpen ? `4px 0 24px rgba(0,0,0,.4)` : "none",
              overflowY: "auto",
              overflowX: "hidden",
              fontFamily: "'Fredoka',sans-serif",
              pointerEvents: "auto",
            }}>
            {/* Drawer header */}
            <div style={{
              padding: "22px 18px 14px",
              borderBottom: "1px solid rgba(255,255,255,.06)",
            }}>
              <div style={{ fontSize: 18, color: "rgba(255,255,255,.6)", fontWeight: 600 }}>
                Jump to...
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.25)", marginTop: 4 }}>
                Slide {currentSlideNum} of {totalSlideCount}
              </div>
            </div>

            {/* Groups and sections */}
            <div style={{ padding: "6px 0 16px" }}>
              {GROUPS.map((group, gi) => {
                const groupColor = COLORS[group.start % COLORS.length];
                return (
                  <div key={gi}>
                    {/* Group header */}
                    <div style={{
                      padding: "10px 18px 5px",
                      marginTop: gi > 0 ? 10 : 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}>
                      <div style={{
                        width: 3,
                        height: 14,
                        borderRadius: 2,
                        background: groupColor,
                      }} />
                      <span style={{
                        fontSize: 10,
                        letterSpacing: 2.5,
                        textTransform: "uppercase",
                        color: `${groupColor}99`,
                      }}>
                        {group.name}
                      </span>
                    </div>

                    {/* Section items */}
                    {Array.from(
                      { length: group.end - group.start + 1 },
                      (_, i) => group.start + i,
                    ).map(si => {
                      const isActive = si === sec;
                      const isDone = done.has(si);
                      const sColor = COLORS[si % COLORS.length];
                      const totalSlidesInSec = PRESENTATION_SLIDES[si] || 1;
                      const slidesDone = isActive ? slide + 1 : (isDone ? totalSlidesInSec : 0);
                      const pct = (slidesDone / totalSlidesInSec) * 100;

                      return (
                        <div
                          key={si}
                          onClick={() => jumpToSection(si)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "9px 14px",
                            margin: "2px 8px",
                            borderRadius: 10,
                            cursor: "pointer",
                            borderLeft: `3px solid ${isActive ? sColor : "transparent"}`,
                            background: isActive ? `${sColor}12` : "transparent",
                            transition: "all .15s ease",
                          }}
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,.05)"; }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                        >
                          {/* Number / check */}
                          <div style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: isDone ? `${sColor}25` : (isActive ? `${sColor}25` : "rgba(255,255,255,.06)"),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            {isDone
                              ? <CheckCircle size={14} weight="fill" color={sColor} />
                              : <span style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: isActive ? sColor : "rgba(255,255,255,.25)",
                                }}>
                                  {si + 1}
                                </span>}
                          </div>

                          {/* Title + mini progress */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 13,
                              color: isActive ? "white" : (isDone ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.55)"),
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}>
                              {TITLES[si]}
                            </div>
                            {(isActive || isDone) && (
                              <div style={{
                                height: 2,
                                borderRadius: 1,
                                marginTop: 5,
                                background: "rgba(255,255,255,.06)",
                              }}>
                                <div style={{
                                  height: "100%",
                                  borderRadius: 1,
                                  width: `${pct}%`,
                                  background: isDone ? `${sColor}55` : sColor,
                                  transition: "width .3s ease",
                                }} />
                              </div>
                            )}
                          </div>

                          {/* Slide count + active dot */}
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            flexShrink: 0,
                          }}>
                            {(isActive || isDone) && (
                              <span style={{
                                fontSize: 10,
                                color: "rgba(255,255,255,.2)",
                              }}>
                                {slidesDone}/{totalSlidesInSec}
                              </span>
                            )}
                            {isActive && (
                              <div style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: sColor,
                                animation: "navDot 1.5s ease-in-out infinite",
                              }} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{
              padding: "10px 18px 14px",
              borderTop: "1px solid rgba(255,255,255,.06)",
              fontSize: 11,
              color: "rgba(255,255,255,.2)",
              textAlign: "center",
            }}>
              Press <kbd style={{
                padding: "2px 6px",
                borderRadius: 4,
                background: "rgba(255,255,255,.08)",
                fontSize: 10,
              }}>Esc</kbd> to close
            </div>
            </div>

            {/* Toggle tab — rides on the right edge of the drawer */}
            <button
              onClick={() => setNavOpen(o => !o)}
              style={{
                alignSelf: "center",
                width: 32,
                height: 48,
                flexShrink: 0,
                borderRadius: "0 10px 10px 0",
                border: `1px solid rgba(255,255,255,.12)`,
                borderLeft: "none",
                background: navOpen ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.06)",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(8px)",
                transition: "background .2s ease",
                animation: navOpen ? "none" : "navPulse 3s ease-in-out infinite",
                pointerEvents: "auto",
              }}
            >
              {navOpen
                ? <CaretLeft size={16} weight="bold" />
                : <List size={16} weight="bold" />}
            </button>
          </div>
        </>
      )}

      {/* ── Teacher Drawer ── */}
      <TeacherDrawer
        open={teacherOpen}
        onToggle={() => setTeacherOpen(o => !o)}
        notes={currentNotes}
        sectionTitle={TITLES[sec]}
        slideLabel={`Slide ${slide + 1} of ${PRESENTATION_SLIDES[sec]}`}
        color={color}
        isTeacherMode={isTeacherMode}
      />

      {/* Header — thin progress bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "transparent",
      }}>
        <div style={{ height: 2, background: "rgba(255,255,255,.08)" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: `${color}88`, transition: "width .5s ease", borderRadius: "0 2px 2px 0" }} />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: isPres ? 960 : 780,
          margin: "0 auto",
          padding: isPres ? "0 40px" : (isMinimal ? "32px 28px 72px" : "88px 28px 96px"),
          position: "relative",
          zIndex: 10,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
        key={`${sec}-${slide}`}
      >
        <SectionComponent color={color} mode="presentation" slide={slide} />
      </div>

      {/* Footer nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, padding: "13px 22px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "transparent", zIndex: 100,
      }}>
        <button onClick={prev} disabled={sec === 0 && slide === 0} className="ghost-btn" style={{ opacity: (sec === 0 && slide === 0) ? 0.2 : 0.5 }}>
          <ArrowLeft size={18} weight="bold" />
        </button>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 13, color: "rgba(255,255,255,.3)", textAlign: "center", lineHeight: 1.3 }}>
          <div>{currentSlideNum} / {totalSlideCount}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {PRESENTATION_SKIP[sec] !== undefined && slide < PRESENTATION_SKIP[sec] && (
            <button
              onClick={() => setSlide(PRESENTATION_SKIP[sec])}
              className="ghost-btn"
              style={{ opacity: 0.45, fontSize: 13, gap: 5, padding: "8px 14px" }}
            >
              Skip <FastForward size={15} weight="bold" />
            </button>
          )}
          {sec < TOTAL - 1 || slide < (PRESENTATION_SLIDES[sec] || 1) - 1
            ? <button onClick={next} className="ghost-btn" style={{ opacity: 0.5 }}>
                <ArrowRight size={18} weight="bold" />
              </button>
            : <button onClick={() => { setSec(0); setSlide(0); setDone(new Set()); }} className="ghost-btn" style={{ opacity: 0.5 }}>
                <ArrowCounterClockwise size={18} weight="bold" />
              </button>
          }
        </div>
      </div>
    </div>
  );
}
