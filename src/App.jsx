import { useState, useEffect, useCallback } from "react";
import { Robot, ChalkboardTeacher, GameController, Eye, ArrowCounterClockwise, ArrowRight, ArrowLeft, FastForward, List, CaretLeft, CheckCircle, GraduationCap } from "@phosphor-icons/react";
import { ALL_CSS } from "./styles/global";
import { COLORS, TOTAL, GROUPS, TITLES } from "./data/constants";
import { TEACHER_NOTES } from "./data/teacherNotes";
import { GRADE_CONFIG } from "./data/gradeConfig";
import { GradeContext, GRADES } from "./data/GradeContext";
import TeacherDrawer from "./components/TeacherDrawer";

import ModeSelect from "./components/ModeSelect";
import Glossary from "./components/Glossary";
import KnowledgeCheck from "./components/KnowledgeCheck";
import SectionWhoIsHere from "./components/SectionWhoIsHere";
import SectionStoryMash from "./components/SectionStoryMash";
import SectionWhatIsAI from "./components/SectionWhatIsAI";
import SectionProgramsVsAI from "./components/SectionProgramsVsAI";
import SectionHowItLearns from "./components/SectionHowItLearns";
import SectionBrainVsAI from "./components/SectionBrainVsAI";
import SectionWhatIsLLM from "./components/SectionWhatIsLLM";
import SectionMeetModels from "./components/SectionMeetModels";
import SectionTheBridge from "./components/SectionTheBridge";
import SectionThreeSteps from "./components/SectionThreeSteps";
import SectionHook from "./components/SectionHook";
import SectionTokens from "./components/SectionTokens";
import SectionEmbeddings from "./components/SectionEmbeddings";
import SectionBeyond2D from "./components/SectionBeyond2D";
import SectionAttention from "./components/SectionAttention";
import SectionMLP from "./components/SectionMLP";
import SectionLayers from "./components/SectionLayers";
import SectionPredict from "./components/SectionPredict";
import SectionTryIt from "./components/SectionTryIt";
import SectionBeyondKnowledge from "./components/SectionBeyondKnowledge";
import JoinRoom from "./components/JoinRoom";
import FeatureFlags, { loadFlags } from "./components/FeatureFlags";
import SessionReview, { SessionTeaser } from "./components/SessionReview";
import RoamingCat from "./components/catai/cat_runner_react_component";
import { SESSION_CONFIG, SESSION_COLORS } from "./data/sessionConfig";

// If ?join=CODE is in the URL, render the mobile join page instead
const JOIN_CODE = new URLSearchParams(window.location.search).get("join");

// ── V1: Current section order ──
const SECTIONS_V1 = [
  SectionWhoIsHere,
  SectionStoryMash,
  SectionWhatIsAI,
  SectionProgramsVsAI,
  SectionBrainVsAI,
  SectionWhatIsLLM,
  SectionMeetModels,
  SectionTheBridge,
  SectionHowItLearns,
  SectionThreeSteps,
  SectionHook,
  SectionTokens,
  SectionEmbeddings,
  SectionBeyond2D,
  SectionAttention,
  SectionMLP,
  SectionLayers,
  SectionPredict,
  SectionTryIt,
  SectionBeyondKnowledge,
];

// ── V2: Proposed reordering ──
// Changes: BrainVsAI stays in group 1, HowItLearns+ThreeSteps move before TheBridge
const SECTIONS_V2 = [
  SectionWhoIsHere,     // 0  — Group 1: What Is AI?
  SectionStoryMash,     // 1
  SectionWhatIsAI,      // 2
  SectionProgramsVsAI,  // 3
  SectionBrainVsAI,     // 4  — now in group 1 (was group 2)
  SectionWhatIsLLM,     // 5  — Group 2: Meet the LLMs
  SectionMeetModels,    // 6
  SectionHowItLearns,   // 7  — moved up (was 8)
  SectionThreeSteps,    // 8  — moved up (was 9)
  SectionTheBridge,     // 9  — Group 3: Inside the Machine (was 7, now opens the deep dive)
  SectionHook,          // 10
  SectionTokens,        // 11
  SectionEmbeddings,    // 12
  SectionBeyond2D,      // 13
  SectionAttention,     // 14
  SectionMLP,           // 15 — Group 4: How AI Writes
  SectionLayers,        // 16
  SectionPredict,       // 17
  SectionTryIt,             // 18 — Group 5: Try It!
  SectionBeyondKnowledge,   // 19 — Group 6: Bonus
];

// V2 index mapping: v2Position → v1Position (for slide count remapping)
const V2_TO_V1 = [0, 1, 2, 3, 4, 5, 6, 8, 9, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

// V2 groups and titles
const GROUPS_V2 = [
  { name: "What Is AI?",        start: 0,  end: 4  },
  { name: "Meet the LLMs",      start: 5,  end: 8  },
  { name: "Inside the Machine", start: 9,  end: 14 },
  { name: "How AI Writes",      start: 15, end: 17 },
  { name: "Try It!",            start: 18, end: 18 },
  { name: "Bonus",              start: 19, end: 19 },
];

const TITLES_V2 = [
  "Who's Used AI?",          // 0
  "Story Mash-Up!",          // 1
  "What IS AI?",             // 2
  "Rules vs Learning",       // 3
  "Brain vs AI",             // 4
  "What's an LLM?",          // 5
  "Meet the Models",         // 6
  "How AI Learns",           // 7 (was index 8)
  "Three Steps to Helpful AI", // 8 (was index 9)
  "The Big Question",        // 9 (was index 7)
  "Numbers & Words",         // 10
  "Tokens — Not Quite Words",// 11
  "Words in Space",          // 12
  "Beyond 2D",               // 13
  "Attention!",              // 14
  "The Thinking Layer",      // 15
  "Rinse & Repeat",          // 16
  "Predict!",                // 17
  "Try It Yourself!",        // 18
  "Beyond What AI Knows",    // 19
];

// Remap colors for v2 ordering
const COLORS_V2 = V2_TO_V1.map(oldIdx => COLORS[oldIdx % COLORS.length]);

// Remap grade slide counts for v2
function getV2Slides(gradeKey) {
  const original = GRADE_CONFIG[gradeKey].presentationSlides;
  return V2_TO_V1.map(oldIdx => original[oldIdx] || 0);
}

// Remap teacher notes for v2
function getV2TeacherNotes() {
  return V2_TO_V1.map(oldIdx => TEACHER_NOTES[oldIdx] || {});
}

// Default slide counts (3-5 grade level) — overridden by GRADE_CONFIG
const DEFAULT_SLIDES = GRADE_CONFIG["3-5"].presentationSlides;

// Sections with a "skip to takeaway" button — maps section index → takeaway slide
const PRESENTATION_SKIP = {
  3: 5,   // SectionProgramsVsAI → insight slide
  4: 7,   // SectionBrainVsAI → insight slide
};

// Custom event for sections to signal they're fully revealed
const SECTION_DONE_EVENT = "sectionFullyRevealed";

// Map URL hash fragments to section indices
const HASH_SECTIONS = { "try-it": SECTIONS_V1.length - 1 };

// AI Cat: V2 section indices where the cat appears, with per-slide quotes
// Each entry: { slide: number, quotes: string[] }
const CAT_SECTIONS = {
  3: {  // Rules vs Learning — appears after reveal that cat/dog app is AI
    slide: 2,
    quotes: [
      "They used ME as an example? Typical.",
      "I'm not a program... I'm a learning machine!",
      "Rules say I'm a cat. AI had to figure it out.",
      "Cat detection: the OG AI flex.",
    ],
  },
  7: {  // How AI Learns — knock-knock joke opening
    slide: 0,
    quotes: [
      "Meow, who's there?",
    ],
  },
  10: { // Numbers & Words — "when you see 'cat', what do you think?"
    slide: 1,
    quotes: [
      "ME!",
      "Did someone say cat?!",
      "You called?",
    ],
  },
  11: { // Tokens — words chopped into pieces
    slide: 0,
    quotes: [
      "They tokenized my name into 'c' + 'at'. Rude.",
      "I'm not just a token! I'm a whole cat!",
      "Break me into tokens? I break into treats.",
      "Meow = token #28719. Just checked.",
    ],
  },
  14: { // Attention! — bat disambiguation
    slide: 0,
    quotes: [
      "Wait... bat like the animal, right? Asking for a friend.",
      "Attention is all you need... and treats.",
      "I pay attention to the important things. Like lunch.",
      "Bat? I prefer to attend to the tuna nearby.",
    ],
  },
  6: {  // Meet the Models — introducing AI models
    slide: 0,
    quotes: [
      "Where's MY model card?",
      "ChatGPT, Claude, Gemini... and ME!",
      "I'm the AI they didn't tell you about.",
    ],
  },
  16: { // Rinse & Repeat (Layers) — 96 layers and "cat sat on the mat"
    slide: 1,
    quotes: [
      "96 layers? That's a lot of thinking about me.",
      "The cat sat on the mat. Obviously.",
      "After 96 layers, they finally got my name right.",
    ],
  },
  17: { // Predict! — interactive prediction
    slide: 0,
    quotes: [
      "I predict... dinner. Always dinner.",
      "Top-p? I prefer top-cat.",
      "Next word prediction: meow meow meow meow.",
      "Randomness set to maximum. Chaos cat activated.",
    ],
  },
  19: { // Beyond What AI Knows — farewell
    slide: 0,
    quotes: [
      "Beyond what AI knows? I know it's treat time.",
      "Thanks for learning with me!",
      "You now know more about AI than most cats.",
    ],
  },
};

export default function App() {
  // If ?join=CODE is in the URL, render the mobile join page
  if (JOIN_CODE) {
    return <JoinRoom code={JOIN_CODE.toUpperCase()} />;
  }

  // Check for hash deep-link on initial load
  const hashTarget = window.location.hash.replace("#", "");
  const deepLink = HASH_SECTIONS[hashTarget];

  const [flags, setFlags] = useState(loadFlags);
  const [mode, setMode] = useState(deepLink != null ? "student" : null);
  const [grade, setGrade] = useState("3-5");
  const [session, setSession] = useState(0);
  const [sec, setSec] = useState(deepLink != null ? deepLink : 0);
  const [slide, setSlide] = useState(deepLink != null ? 1 : 0);
  const [done, setDone] = useState(new Set());
  const [navOpen, setNavOpen] = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = flags.mobileOptimized && windowWidth <= 768;

  // Track window width
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isV2 = flags.flowVersion;
  const isV3 = flags.multiSession;

  // ── V3 multi-session logic ──
  // When v3 is active, we build a session-scoped view on top of the V2 section order.
  const v3SessionConfig = isV3 ? SESSION_CONFIG[grade]?.sessions?.[session] : null;
  const v3Reviews = v3SessionConfig?.review || [];
  const v3HasReview = session > 0 && v3Reviews.length > 0;
  const v3ReviewSlideCount = v3HasReview ? 1 + v3Reviews.length : 0; // 1 title + N questions
  const v3HasTeaser = isV3 && session < 2 && v3SessionConfig?.teaser;
  const v3TeaserSlideCount = v3HasTeaser ? 1 : 0;
  const v3NextSession = isV3 && session < 2 ? SESSION_CONFIG[grade]?.sessions?.[session + 1] : null;

  // Build the active section list
  let SECTIONS, activeGROUPS, activeTITLES, activeCOLORS, activeNOTES;

  if (isV3) {
    // V3 always uses V2 ordering as its base
    const sessionSections = v3SessionConfig?.sections || [];
    SECTIONS = sessionSections.map(idx => SECTIONS_V2[idx]);
    activeTITLES = sessionSections.map(idx => TITLES_V2[idx]);
    activeCOLORS = sessionSections.map(idx => COLORS_V2[idx % COLORS_V2.length]);
    activeNOTES = sessionSections.map(idx => getV2TeacherNotes()[idx] || {});
    activeGROUPS = [
      { name: v3SessionConfig?.name || "Session", start: 0, end: sessionSections.length - 1 },
    ];
  } else if (isV2) {
    SECTIONS = SECTIONS_V2;
    activeGROUPS = GROUPS_V2;
    activeTITLES = TITLES_V2;
    activeCOLORS = COLORS_V2;
    activeNOTES = getV2TeacherNotes();
  } else {
    SECTIONS = SECTIONS_V1;
    activeGROUPS = GROUPS;
    activeTITLES = TITLES;
    activeCOLORS = COLORS;
    activeNOTES = TEACHER_NOTES;
  }

  // Total number of "slots" the user navigates through
  const v3SectionCount = SECTIONS.length;
  const v3TotalSlots = (isV3 ? v3ReviewSlideCount + v3SectionCount + v3TeaserSlideCount : SECTIONS.length);

  const isTeacherMode = mode === "teacher";
  const isPres = mode === "student" || mode === "teacher";

  // Build presentation slide counts
  let PRESENTATION_SLIDES;
  if (isV3) {
    const sessionSections = v3SessionConfig?.sections || [];
    const v2Slides = getV2Slides(grade);
    const sectionSlides = sessionSections.map(idx => v2Slides[idx] || 1);
    // Prepend review slides, append teaser
    const reviewSlides = v3HasReview ? Array(v3ReviewSlideCount).fill(1) : [];
    const teaserSlides = v3HasTeaser ? [1] : [];
    PRESENTATION_SLIDES = [...reviewSlides, ...sectionSlides, ...teaserSlides];
  } else if (isV2) {
    PRESENTATION_SLIDES = getV2Slides(grade);
  } else {
    PRESENTATION_SLIDES = GRADE_CONFIG[grade]?.presentationSlides || DEFAULT_SLIDES;
  }

  // In v3, map logical sec index to what kind of slot it is
  const v3IsReviewSlide = isV3 && v3HasReview && sec < v3ReviewSlideCount;
  const v3IsTeaserSlide = isV3 && v3HasTeaser && sec === v3TotalSlots - 1;
  const v3ContentSecIndex = isV3 ? sec - v3ReviewSlideCount : sec;

  // Open teacher drawer automatically when entering teacher mode
  useEffect(() => {
    if (mode === "teacher") setTeacherOpen(true);
  }, [mode]);

  const jumpToSection = useCallback((targetSec) => {
    setSec(targetSec);
    setSlide(0);
    setNavOpen(false);
  }, []);

  const sectionTotal = isV3 ? v3TotalSlots : TOTAL;

  const next = useCallback(() => {
    const maxSlides = PRESENTATION_SLIDES[sec] || 1;
    if (slide < maxSlides - 1) {
      setSlide(s => s + 1);
      return;
    }
    if (sec < sectionTotal - 1) {
      setDone(p => new Set([...p, sec]));
      let nextSec = sec + 1;
      while (nextSec < sectionTotal - 1 && PRESENTATION_SLIDES[nextSec] === 0) {
        setDone(p => new Set([...p, nextSec]));
        nextSec++;
      }
      setSec(nextSec);
      setSlide(0);
    } else if (isV3 && session < 2) {
      // At the end of a v3 session, advance to next session
      goToNextSession();
    }
  }, [sec, slide, sectionTotal]);

  const goToNextSession = useCallback(() => {
    if (!isV3 || session >= 2) return;
    setSession(session + 1);
    setSec(0);
    setSlide(0);
    setDone(new Set());
  }, [isV3, session]);

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
      // Suppress navigation while nav drawer is open (but NOT teacher drawer)
      if (navOpen) return;
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

  // Listen for jumpToSlide events from components (e.g. retry button)
  useEffect(() => {
    const handler = (e) => setSlide(e.detail);
    window.addEventListener("jumpToSlide", handler);
    return () => window.removeEventListener("jumpToSlide", handler);
  }, []);

  if (!mode) return <ModeSelect onSelect={setMode} grade={grade} onGradeChange={setGrade} allCss={ALL_CSS} flags={flags} session={session} onSessionChange={setSession} />;
  if (mode === "flags") return <FeatureFlags onBack={() => { setFlags(loadFlags()); setMode(null); }} allCss={ALL_CSS} />;
  if (mode === "glossary") return <><style>{ALL_CSS}</style><Glossary onBack={() => setMode(null)} /></>;
  if (mode === "quiz") return <><style>{ALL_CSS}</style><KnowledgeCheck onBack={() => setMode(null)} flags={flags} /></>;

  // In v3 mode, review/teaser slides use the session color; content slides use section colors
  const v3SessionColor = isV3 ? SESSION_COLORS[session] : null;
  const color = (isV3 && (v3IsReviewSlide || v3IsTeaserSlide))
    ? v3SessionColor
    : (isV3 ? activeCOLORS[v3ContentSecIndex % activeCOLORS.length] : activeCOLORS[sec % activeCOLORS.length]);

  // For the nav drawer, offset groups by the review slide count in v3
  const v3NavGroups = isV3
    ? [{
        name: v3SessionConfig?.name || "Session",
        start: v3ReviewSlideCount,
        end: v3ReviewSlideCount + v3SectionCount - 1,
      }]
    : activeGROUPS;
  const currentGroup = isV3
    ? v3NavGroups[0]
    : activeGROUPS.find(g => sec >= g.start && sec <= g.end);

  // Progress — always slide-based
  const totalSlideCount = PRESENTATION_SLIDES.reduce((a, b) => a + b, 0);
  const currentSlideNum = PRESENTATION_SLIDES.slice(0, sec).reduce((a, b) => a + b, 0) + slide + 1;
  const progressPct = Math.round((currentSlideNum / totalSlideCount) * 100);

  // Teacher notes for current slide
  const currentNotes = (isV3 && !v3IsReviewSlide && !v3IsTeaserSlide)
    ? (activeNOTES[v3ContentSecIndex]?.slides?.[slide] || {})
    : (isV3 ? {} : (activeNOTES[sec]?.slides?.[slide] || {}));

  const stars = Array.from({ length: 80 }, (_, i) => ({
    x: ((i * 137.508) % 100).toFixed(2),
    y: ((i * 73.214) % 100).toFixed(2),
    s: (0.5 + (i % 5) * .35).toFixed(1),
    d: (1.2 + (i % 5) * .6).toFixed(1),
    dl: ((i % 30) * .1).toFixed(1),
  }));

  // Determine what to render for this "sec" slot
  const SectionComponent = (isV3 && (v3IsReviewSlide || v3IsTeaserSlide))
    ? null
    : (isV3 ? SECTIONS[v3ContentSecIndex] : SECTIONS[sec]);

  return (
    <GradeContext.Provider value={grade}>
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

            {/* Grade switcher */}
            <div style={{
              padding: "10px 14px",
              borderBottom: "1px solid rgba(255,255,255,.06)",
            }}>
              <div style={{
                display: "flex",
                gap: 0,
                background: "rgba(255,255,255,.05)",
                borderRadius: 10,
                padding: 3,
              }}>
                {GRADES.map(g => {
                  const active = g === grade;
                  return (
                    <button
                      key={g}
                      onClick={() => {
                        setGrade(g);
                        setSlide(0);
                      }}
                      style={{
                        fontFamily: "'Fredoka',sans-serif",
                        fontSize: 12,
                        fontWeight: active ? 700 : 500,
                        padding: "6px 0",
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        background: active ? "rgba(255,255,255,.12)" : "transparent",
                        color: active ? "white" : "rgba(255,255,255,.3)",
                        transition: "all .2s ease",
                        flex: 1,
                      }}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
              <div style={{
                fontSize: 10,
                color: "rgba(255,255,255,.2)",
                textAlign: "center",
                marginTop: 4,
              }}>
                {GRADE_CONFIG[grade].label} &middot; {GRADE_CONFIG[grade].duration}
              </div>
            </div>

            {/* Groups and sections */}
            <div style={{ padding: "6px 0 16px" }}>
              {(isV3 ? v3NavGroups : activeGROUPS).map((group, gi) => {
                const groupColor = isV3 ? v3SessionColor : activeCOLORS[group.start % activeCOLORS.length];
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
                      const titleIdx = isV3 ? si - v3ReviewSlideCount : si;
                      const sColor = isV3 ? activeCOLORS[titleIdx % activeCOLORS.length] : activeCOLORS[si % activeCOLORS.length];
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
                                  {isV3 ? titleIdx + 1 : si + 1}
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
                              {isV3 ? activeTITLES[titleIdx] : activeTITLES[si]}
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
        connections={isV3 && !v3IsReviewSlide && !v3IsTeaserSlide ? activeNOTES[v3ContentSecIndex]?.connections : (isV3 ? undefined : activeNOTES[sec]?.connections)}
        sectionTitle={isV3 ? (v3IsReviewSlide ? "Review" : v3IsTeaserSlide ? "Coming Up" : activeTITLES[v3ContentSecIndex]) : activeTITLES[sec]}
        slideLabel={`Slide ${slide + 1} of ${PRESENTATION_SLIDES[sec]}`}
        color={color}
        isTeacherMode={isTeacherMode}
      />

      {/* Home button — top right */}
      <button
        onClick={() => { setMode(null); setSec(0); setSlide(0); setDone(new Set()); setNavOpen(false); setTeacherOpen(false); setSession(0); }}
        style={{
          position: "fixed",
          top: 10,
          left: 12,
          zIndex: 120,
          width: 36,
          height: 36,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,.1)",
          background: "rgba(255,255,255,.06)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all .2s ease",
          backdropFilter: "blur(8px)",
          padding: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.14)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.06)"}
        title="Home"
      >
        <img
          src={`${import.meta.env.BASE_URL}robotcomputerbrain.png`}
          alt="Home"
          style={{ width: 22, height: "auto", opacity: 0.7 }}
        />
      </button>

      {/* Header — thin progress bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "transparent",
      }}>
        <div style={{ height: 2, background: "rgba(255,255,255,.08)" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: `${color}88`, transition: "width .5s ease", borderRadius: "0 2px 2px 0" }} />
        </div>
      </div>

      {/* Content — shifts left when teacher drawer is open (desktop only) */}
      <div
        className="pres-content"
        style={{
          maxWidth: isPres ? 960 : 780,
          margin: "0 auto",
          padding: isPres ? "0 40px" : "88px 28px 96px",
          paddingRight: (teacherOpen && !isMobile && flags.teacherDrawerPush) ? 360 : (isPres ? 40 : 28),
          position: "relative",
          zIndex: 10,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          transition: "padding-right .3s cubic-bezier(.4,0,.2,1)",
        }}
        key={sec}
      >
        {isV3 && v3IsReviewSlide ? (
          <SessionReview
            reviews={v3Reviews}
            slide={sec}
            sessionName={v3SessionConfig?.name}
            subtitle={v3SessionConfig?.subtitle}
            sessionIndex={session}
            color={v3SessionColor}
          />
        ) : isV3 && v3IsTeaserSlide ? (
          <SessionTeaser
            teaser={v3SessionConfig?.teaser}
            nextSessionName={v3NextSession?.name}
            color={v3NextSession ? SESSION_COLORS[session + 1] : v3SessionColor}
            onStartNext={session < 2 ? goToNextSession : undefined}
          />
        ) : SectionComponent ? (
          <SectionComponent color={color} mode="presentation" slide={slide} />
        ) : null}

        {/* AI Cat — appears on select sections/slides when flag is on */}
        {flags.roamingCat && (() => {
          const v2Idx = isV3
            ? (v3SessionConfig?.sections?.[v3ContentSecIndex] ?? -1)
            : (isV2 ? sec : -1);
          const catConfig = CAT_SECTIONS[v2Idx];
          if (!catConfig || slide !== catConfig.slide) return null;
          return <RoamingCat key={`${v2Idx}-${slide}`} quotes={catConfig.quotes} />;
        })()}
      </div>

      {/* Footer nav */}
      <div className="pres-footer" style={{
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
          {!isV3 && PRESENTATION_SKIP[sec] !== undefined && slide < PRESENTATION_SKIP[sec] && (
            <button
              onClick={() => setSlide(PRESENTATION_SKIP[sec])}
              className="ghost-btn"
              style={{ opacity: 0.45, fontSize: 13, gap: 5, padding: "8px 14px" }}
            >
              Skip <FastForward size={15} weight="bold" />
            </button>
          )}
          {sec < sectionTotal - 1 || slide < (PRESENTATION_SLIDES[sec] || 1) - 1
            ? <button onClick={next} className="ghost-btn" style={{ opacity: 0.5 }}>
                <ArrowRight size={18} weight="bold" />
              </button>
            : isV3 && session < 2
            ? <button onClick={goToNextSession} className="ghost-btn" style={{ opacity: 0.5 }}>
                <ArrowRight size={18} weight="bold" />
              </button>
            : <button onClick={() => { setSec(0); setSlide(0); setDone(new Set()); }} className="ghost-btn" style={{ opacity: 0.5 }}>
                <ArrowCounterClockwise size={18} weight="bold" />
              </button>
          }
        </div>
      </div>
    </div>
    </GradeContext.Provider>
  );
}
