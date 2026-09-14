import { useState, useEffect, useCallback } from "react";
import { ArrowCounterClockwise, ArrowRight, ArrowLeft, FastForward, List, CaretLeft, CheckCircle } from "@phosphor-icons/react";
import { ALL_CSS } from "./styles/global";
import { SECTIONS as ALL_SECTIONS, SECTION_BY_ID, buildGroups } from "./data/sections";
import { NOTES_BY_ID } from "./data/teacherNotes";
import { GRADE_CONFIG, slidesFor } from "./data/gradeConfig";
import { GradeContext, GRADES } from "./data/GradeContext";
import TeacherDrawer from "./components/TeacherDrawer";

import ModeSelect from "./components/ModeSelect";
import Glossary from "./components/Glossary";
import KnowledgeCheck from "./components/KnowledgeCheck";
import StudentView from "./components/StudentView";
import PresenterBar from "./components/PresenterBar";
import { useRoom } from "./data/room";
import { loadLesson, saveLesson } from "./data/lesson";
import FeatureFlags, { loadFlags } from "./components/FeatureFlags";
import SessionReview, { SessionTeaser } from "./components/SessionReview";
import RoamingCat from "./components/catai/cat_runner_react_component";
import { SESSION_CONFIG, SESSION_COLORS } from "./data/sessionConfig";

// If ?join=CODE is in the URL, render the mobile join page instead
const JOIN_CODE = new URLSearchParams(window.location.search).get("join");

// Canonical course flow lives in src/data/sections.js. Everything below is
// derived from it and keyed by stable section id — never by array position.

// Nav groups (contiguous act runs), plus title/color/notes arrays aligned to
// the canonical section order.
const GROUPS = buildGroups(ALL_SECTIONS);
const TITLES = ALL_SECTIONS.map(s => s.title);
const COLORS = ALL_SECTIONS.map(s => s.color);
const NOTES = ALL_SECTIONS.map(s => NOTES_BY_ID[s.id] || {});

// Sections with a "skip to takeaway" button — section id → takeaway slide index
const PRESENTATION_SKIP = {
  "rules-vs-learning": 5,
  "brain-vs-ai": 7,
};

// AI Cat cameos — section id → { slide, quotes }
const CAT_SECTIONS = {
  "rules-vs-learning": {  // appears after reveal that cat/dog app is AI
    slide: 2,
    quotes: [
      "They used ME as an example? Typical.",
      "I'm not a program... I'm a learning machine!",
      "Rules say I'm a cat. AI had to figure it out.",
      "Cat detection: the OG AI flex.",
    ],
  },
  "how-it-learns": {  // knock-knock joke opening
    slide: 0,
    quotes: [
      "Meow, who's there?",
    ],
  },
  "meet-models": {  // introducing AI models
    slide: 0,
    quotes: [
      "Where's MY model card?",
      "ChatGPT, Claude, Gemini... and ME!",
      "I'm the AI they didn't tell you about.",
    ],
  },
  "numbers-words": {  // "when you see 'cat', what do you think?"
    slide: 1,
    quotes: [
      "ME!",
      "Did someone say cat?!",
      "You called?",
    ],
  },
  "tokens": {  // words chopped into pieces
    slide: 0,
    quotes: [
      "They tokenized my name into 'c' + 'at'. Rude.",
      "I'm not just a token! I'm a whole cat!",
      "Break me into tokens? I break into treats.",
      "Meow = token #28719. Just checked.",
    ],
  },
  "attention": {  // bat disambiguation
    slide: 0,
    quotes: [
      "Wait... bat like the animal, right? Asking for a friend.",
      "Attention is all you need... and treats.",
      "I pay attention to the important things. Like lunch.",
      "Bat? I prefer to attend to the tuna nearby.",
    ],
  },
  "what-is-llm": {  // the "companies build LLMs" slide
    slide: 3,
    quotes: [
      "Where's MY model card?",
      "ChatGPT, Claude, Gemini, Llama... and ME!",
      "Every company's got an LLM. I've got nine lives.",
      "I'm the AI they didn't tell you about.",
    ],
  },
  "layers": {  // 96 layers and "cat sat on the mat"
    slide: 1,
    quotes: [
      "96 layers? That's a lot of thinking about me.",
      "The cat sat on the mat. Obviously.",
      "After 96 layers, they finally got my name right.",
    ],
  },
  "predict": {  // interactive prediction
    slide: 0,
    quotes: [
      "I predict... dinner. Always dinner.",
      "Top-p? I prefer top-cat.",
      "Next word prediction: meow meow meow meow.",
      "Randomness set to maximum. Chaos cat activated.",
    ],
  },
  "reasoning": {  // reasoning models
    slide: 0,
    quotes: [
      "Thinking before speaking? Revolutionary.",
      "I always think before I pounce. Well, sometimes.",
      "Step 1: Think. Step 2: Nap. Step 3: Think about napping.",
      "My reasoning: if it fits, I sits.",
    ],
  },
  "beyond-knowledge": {  // bonus: tools & RAG
    slide: 0,
    quotes: [
      "Beyond what AI knows? I know it's treat time.",
      "Tools? My only tool is the snooze button.",
      "RAG: Retrieval-Augmented... Gato.",
    ],
  },
  "wrap-up": {  // farewell
    slide: 1,
    quotes: [
      "Thanks for learning with me!",
      "You now know more about AI than most cats.",
      "Go use AI for good. And treats.",
    ],
  },
};

// Standalone playground shown for the /#try-it deep-link (the slide QR code).
// Self-contained: its own grade context, styles, and background — so it works
// on a phone without any of the presentation flow/flags being active.
function TryItStandalone() {
  const [grade, setGrade] = useState("3-5");
  const color = "#9b5de5";
  return (
    <GradeContext.Provider value={grade}>
      <style>{ALL_CSS}</style>
      <div style={{
        minHeight: "100vh", background: "#050512", color: "white",
        fontFamily: "'Nunito',sans-serif", padding: "32px 18px 64px",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h1 style={{
            fontFamily: "'Fredoka',sans-serif", textAlign: "center",
            fontSize: 34, margin: "8px 0 6px", color,
          }}>
            Try It Yourself!
          </h1>
          <p style={{
            textAlign: "center", color: "rgba(255,255,255,.6)",
            margin: "0 0 24px", fontSize: 16,
          }}>
            Use real AI — predict words, tokenize text, explore Word Space, and generate.
          </p>
          <div style={{
            display: "flex", gap: 8, justifyContent: "center",
            marginBottom: 28, flexWrap: "wrap",
          }}>
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                style={{
                  padding: "8px 18px", borderRadius: 999, cursor: "pointer",
                  fontFamily: "'Fredoka',sans-serif", fontSize: 15,
                  border: `2px solid ${grade === g ? color : "rgba(255,255,255,.18)"}`,
                  background: grade === g ? `${color}22` : "transparent",
                  color: grade === g ? "white" : "rgba(255,255,255,.6)",
                }}
              >
                {g}
              </button>
            ))}
          </div>
          <SectionTryIt color={color} mode="scroll" slide={1} />
        </div>
      </div>
    </GradeContext.Provider>
  );
}

export default function App() {
  // If ?join=CODE is in the URL, render the mobile join page
  if (JOIN_CODE) {
    return <StudentView code={JOIN_CODE.toUpperCase()} />;
  }

  // Deep-link: /#try-it opens the interactive playground on its own, so a
  // student can scan the slide's QR and use it on their device regardless of
  // which flow flags (v1/v2/v3) the visitor happens to have saved. Rendering
  // it standalone avoids the section-index machinery, whose ordering differs
  // per flag version (the old flat-index deep-link landed on the wrong
  // section — or nothing at all — and showed a blank screen).
  if (window.location.hash.replace("#", "") === "try-it") {
    return <TryItStandalone />;
  }

  const [flags, setFlags] = useState(loadFlags);
  const [mode, setMode] = useState(null);
  const [lesson, setLessonState] = useState(loadLesson);
  const roomCtx = useRoom();
  const setLesson = (next) => { setLessonState(next); saveLesson(next); };

  // Entering the lesson creates / retargets / ends the room to match the Interaction choice.
  const enterMode = async (m) => {
    if (m === "student" || m === "teacher") {
      try {
        if (lesson.interaction === "projector") { if (roomCtx.room) await roomCtx.end(); }
        else if (!roomCtx.room) await roomCtx.start(lesson.interaction);
        else if (roomCtx.mode !== lesson.interaction) await roomCtx.setMode(lesson.interaction);
      } catch { /* the landing page shows the room error */ }
    }
    setMode(m);
  };
  const [grade, setGrade] = useState("3-5");
  const [session, setSession] = useState(0);
  const [sec, setSec] = useState(0);
  const [slide, setSlide] = useState(0);
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

  const isV3 = flags.multiSession;

  // ── V3 multi-session logic ──
  // When v3 is active, we build a session-scoped view on top of the canonical order.
  const v3SessionConfig = isV3 ? SESSION_CONFIG[grade]?.sessions?.[session] : null;
  const v3Reviews = v3SessionConfig?.review || [];
  const v3HasReview = session > 0 && v3Reviews.length > 0;
  const v3ReviewSlideCount = v3HasReview ? 1 + v3Reviews.length : 0; // 1 title + N questions
  const v3HasTeaser = isV3 && session < 2 && v3SessionConfig?.teaser;
  const v3TeaserSlideCount = v3HasTeaser ? 1 : 0;
  const v3NextSession = isV3 && session < 2 ? SESSION_CONFIG[grade]?.sessions?.[session + 1] : null;

  // Build the active section list (a session subset in v3, otherwise the full arc).
  let SECTIONS, activeGROUPS, activeTITLES, activeCOLORS, activeNOTES;

  if (isV3) {
    const sessionSections = v3SessionConfig?.sections || []; // array of section ids
    SECTIONS = sessionSections.map(id => SECTION_BY_ID[id]?.Component);
    activeTITLES = sessionSections.map(id => SECTION_BY_ID[id]?.title);
    activeCOLORS = sessionSections.map(id => SECTION_BY_ID[id]?.color);
    activeNOTES = sessionSections.map(id => NOTES_BY_ID[id] || {});
    activeGROUPS = [
      { name: v3SessionConfig?.name || "Session", start: 0, end: sessionSections.length - 1 },
    ];
  } else {
    SECTIONS = ALL_SECTIONS.map(s => s.Component);
    activeGROUPS = GROUPS;
    activeTITLES = TITLES;
    activeCOLORS = COLORS;
    activeNOTES = NOTES;
  }

  // Total number of "slots" the user navigates through
  const v3SectionCount = SECTIONS.length;
  const v3TotalSlots = (isV3 ? v3ReviewSlideCount + v3SectionCount + v3TeaserSlideCount : SECTIONS.length);

  const isTeacherMode = mode === "teacher";
  const isPres = mode === "student" || mode === "teacher";

  // Build presentation slide counts
  let PRESENTATION_SLIDES;
  if (isV3) {
    const sessionSections = v3SessionConfig?.sections || []; // ids
    const sectionSlides = sessionSections.map(id => slidesFor(grade, id) || 1);
    // Prepend review slides, append teaser
    const reviewSlides = v3HasReview ? Array(v3ReviewSlideCount).fill(1) : [];
    const teaserSlides = v3HasTeaser ? [1] : [];
    PRESENTATION_SLIDES = [...reviewSlides, ...sectionSlides, ...teaserSlides];
  } else {
    PRESENTATION_SLIDES = ALL_SECTIONS.map(s => slidesFor(grade, s.id));
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

  // V3: jump to a section in any session (switches session if needed)
  const jumpToV3Section = useCallback((targetSession, positionInSession) => {
    const targetConfig = SESSION_CONFIG[grade]?.sessions?.[targetSession];
    const hasReview = targetSession > 0 && (targetConfig?.review?.length > 0);
    const reviewCount = hasReview ? 1 + targetConfig.review.length : 0;
    setSession(targetSession);
    setSec(reviewCount + positionInSession);
    setSlide(0);
    setDone(new Set());
    setNavOpen(false);
  }, [grade]);

  const sectionTotal = isV3 ? v3TotalSlots : SECTIONS.length;

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

  if (!mode) return <ModeSelect onSelect={enterMode} grade={grade} onGradeChange={setGrade} allCss={ALL_CSS} flags={flags} session={session} onSessionChange={setSession} lesson={lesson} onLessonChange={setLesson} room={roomCtx} />;
  if (mode === "flags") return <FeatureFlags onBack={() => { setFlags(loadFlags()); setMode(null); }} allCss={ALL_CSS} />;
  if (mode === "glossary") return <><style>{ALL_CSS}</style><Glossary onBack={() => setMode(null)} /></>;
  if (mode === "quiz") return <><style>{ALL_CSS}</style><KnowledgeCheck onBack={() => setMode(null)} flags={flags} /></>;

  // In v3 mode, review/teaser slides use the session color; content slides use section colors
  const v3SessionColor = isV3 ? SESSION_COLORS[session] : null;
  const color = (isV3 && (v3IsReviewSlide || v3IsTeaserSlide))
    ? v3SessionColor
    : (isV3 ? activeCOLORS[v3ContentSecIndex % activeCOLORS.length] : activeCOLORS[sec % activeCOLORS.length]);

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

      {/* Room controls (only while a tablet/phones room exists) */}
      <PresenterBar lesson={lesson} onLessonChange={setLesson} />

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
              {isV3 ? (
                /* V3: Show all sessions with their sections */
                (SESSION_CONFIG[grade]?.sessions || []).map((sess, si) => {
                  const isCurrentSession = si === session;
                  const sessColor = SESSION_COLORS[si];
                  const hasReview = si > 0 && (sess.review?.length > 0);
                  const reviewCount = hasReview ? 1 + sess.review.length : 0;

                  return (
                    <div key={si}>
                      {/* Session header */}
                      <div style={{
                        padding: "10px 18px 5px",
                        marginTop: si > 0 ? 10 : 4,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}>
                        <div style={{
                          width: 3,
                          height: 14,
                          borderRadius: 2,
                          background: sessColor,
                          opacity: isCurrentSession ? 1 : 0.4,
                        }} />
                        <span style={{
                          fontSize: 10,
                          letterSpacing: 2.5,
                          textTransform: "uppercase",
                          color: isCurrentSession ? `${sessColor}cc` : `${sessColor}55`,
                        }}>
                          {sess.name}{sess.subtitle ? ` — ${sess.subtitle}` : ""}
                        </span>
                        {isCurrentSession && (
                          <span style={{
                            fontSize: 8,
                            padding: "1px 6px",
                            borderRadius: 6,
                            background: `${sessColor}22`,
                            color: sessColor,
                            fontWeight: 700,
                            letterSpacing: 1,
                          }}>NOW</span>
                        )}
                      </div>

                      {/* Section items for this session */}
                      {sess.sections.map((secId, posInSession) => {
                        const secSlot = reviewCount + posInSession;
                        const isActive = isCurrentSession && secSlot === sec;
                        const isDone = isCurrentSession && done.has(secSlot);
                        const sColor = SECTION_BY_ID[secId]?.color || "#fff";
                        const title = SECTION_BY_ID[secId]?.title || secId;
                        const totalSlidesInSec = slidesFor(grade, secId) || 1;
                        const slidesDone = isActive ? slide + 1 : (isDone ? totalSlidesInSec : 0);
                        const pct = (slidesDone / totalSlidesInSec) * 100;
                        const dimmed = !isCurrentSession;

                        return (
                          <div
                            key={`${si}-${secId}`}
                            onClick={() => isCurrentSession ? jumpToSection(secSlot) : jumpToV3Section(si, posInSession)}
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
                              opacity: dimmed ? 0.45 : 1,
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
                                    {posInSession + 1}
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
                                {title}
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
                })
              ) : (
                /* V1/V2: Standard group-based nav */
                activeGROUPS.map((group, gi) => {
                const groupColor = activeCOLORS[group.start % activeCOLORS.length];
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
                      const sColor = activeCOLORS[si % activeCOLORS.length];
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
                              {activeTITLES[si]}
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
              })
              )}
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
          const secId = isV3
            ? (v3SessionConfig?.sections?.[v3ContentSecIndex] ?? null)
            : (ALL_SECTIONS[sec]?.id ?? null);
          const catConfig = secId ? CAT_SECTIONS[secId] : null;
          if (!catConfig || slide !== catConfig.slide) return null;
          return <RoamingCat key={`${secId}-${slide}`} quotes={catConfig.quotes} />;
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
          {(() => {
            const skipTarget = !isV3 ? PRESENTATION_SKIP[ALL_SECTIONS[sec]?.id] : undefined;
            if (skipTarget === undefined || slide >= skipTarget) return null;
            return (
              <button
                onClick={() => setSlide(skipTarget)}
                className="ghost-btn"
                style={{ opacity: 0.45, fontSize: 13, gap: 5, padding: "8px 14px" }}
              >
                Skip <FastForward size={15} weight="bold" />
              </button>
            );
          })()}
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
