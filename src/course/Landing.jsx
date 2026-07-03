// The syllabus landing page at /course — the course's front door.
import { FONTS, COLORS, TYPE, SPACE, MOBILE_BREAK } from "./styles/theme.js";
import {
  COURSE_TITLE, COURSE_TAGLINE, ACTS, CHAPTERS, BUILT_CHAPTERS, TOTAL_MINUTES,
} from "./data/chapters.js";
import { useEffect, useState } from "react";

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth <= MOBILE_BREAK);
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth <= MOBILE_BREAK);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return mobile;
}

function ChapterCard({ ch, progress, navigate, mobile }) {
  const built = Boolean(ch.Component);
  const chProgress = progress.chapters[ch.slug];
  const done = chProgress?.done;
  const started = chProgress && !done;
  const pct = chProgress ? Math.round(((chProgress.furthestSlide + 1) / ch.slideCount) * 100) : 0;

  return (
    <button
      onClick={built ? () => navigate(ch.slug, 0, { push: true }) : undefined}
      disabled={!built}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: SPACE.sm,
        width: "100%",
        textAlign: "left",
        background: COLORS.surface,
        border: `1px solid ${COLORS.hairline}`,
        borderRadius: 14,
        padding: `${SPACE.sm + 4}px ${SPACE.md}px`,
        cursor: built ? "pointer" : "default",
        opacity: built ? 1 : 0.45,
        transition: "border-color 200ms, transform 200ms cubic-bezier(.2,.7,.3,1)",
      }}
      onMouseEnter={(e) => { if (built) e.currentTarget.style.borderColor = ch.accent + "66"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; }}
    >
      <span
        style={{
          fontFamily: FONTS.mono,
          fontSize: 14,
          color: done ? ch.accent : COLORS.faint,
          paddingTop: 5,
          minWidth: 26,
        }}
      >
        {done ? "✓" : String(ch.num).padStart(2, "0")}
      </span>
      <span style={{ flex: 1 }}>
        <span
          style={{
            display: "block",
            fontFamily: FONTS.display,
            fontSize: mobile ? 21 : TYPE.lead,
            fontWeight: 500,
            color: COLORS.text,
            lineHeight: 1.3,
          }}
        >
          {ch.title}
        </span>
        <span style={{ display: "block", fontSize: 15, color: COLORS.muted, lineHeight: 1.55, marginTop: 4 }}>
          {ch.blurb}
        </span>
        {started && (
          <span style={{ display: "block", marginTop: 10, height: 3, background: "rgba(255,255,255,.08)", borderRadius: 2 }}>
            <span style={{ display: "block", height: "100%", width: `${pct}%`, background: ch.accent, borderRadius: 2 }} />
          </span>
        )}
      </span>
      <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.faint, paddingTop: 6, whiteSpace: "nowrap" }}>
        {built ? `${ch.minutes} min` : "soon"}
      </span>
    </button>
  );
}

export default function Landing({ progress, navigate }) {
  const mobile = useIsMobile();
  const resume = progress.lastChapter && BUILT_CHAPTERS.find((c) => c.slug === progress.lastChapter);
  const anyStarted = Boolean(resume);
  const builtMinutes = BUILT_CHAPTERS.reduce((a, c) => a + c.minutes, 0);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: `${SPACE.xl}px ${SPACE.md}px 120px` }}>
      {/* Hero */}
      <div className="reveal-slow" style={{ padding: `${mobile ? 40 : 88}px 0 ${SPACE.xl}px` }}>
        <div
          style={{
            fontFamily: FONTS.body, fontSize: 13, fontWeight: 600,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: COLORS.muted, marginBottom: SPACE.sm,
          }}
        >
          A course in {CHAPTERS.length} chapters · ~{Math.round(TOTAL_MINUTES / 10) * 10} minutes
        </div>
        <h1 style={{ fontSize: mobile ? 42 : TYPE.hero + 8, fontWeight: 500, letterSpacing: "-0.02em" }}>
          {COURSE_TITLE}
        </h1>
        <p style={{ fontSize: TYPE.lead, color: COLORS.muted, lineHeight: 1.55, marginTop: SPACE.sm, maxWidth: "34ch" }}>
          {COURSE_TAGLINE}
        </p>
        <p style={{ fontSize: TYPE.body, color: COLORS.text, lineHeight: 1.7, marginTop: SPACE.md, maxWidth: "56ch" }}>
          Here is a claim that should bother you: the AI that writes essays, passes exams,
          and cracks jokes is doing exactly one thing — guessing the next word. This course
          is about how that can possibly be true. You'll run the real machinery yourself,
          one idea at a time.
        </p>
        <div style={{ display: "flex", gap: SPACE.sm, marginTop: SPACE.lg, flexWrap: "wrap" }}>
          <button
            className="btn"
            style={{ background: "#6C9EF8", color: "#0B0E14", fontSize: 17 }}
            onClick={() =>
              anyStarted
                ? navigate(resume.slug, progress.lastSlide, { push: true })
                : navigate(BUILT_CHAPTERS[0].slug, 0, { push: true })
            }
          >
            {anyStarted ? "Continue where you left off" : "Begin Chapter 1"}
          </button>
          {anyStarted && (
            <button
              className="btn btn-ghost"
              onClick={() => navigate(BUILT_CHAPTERS[0].slug, 0, { push: true })}
            >
              Start over
            </button>
          )}
        </div>
        <div style={{ fontSize: 14, color: COLORS.faint, marginTop: SPACE.sm }}>
          {BUILT_CHAPTERS.length === CHAPTERS.length
            ? `All ${CHAPTERS.length} chapters · every demo runs a real model · finish with the quiz`
            : `Chapters 1–${BUILT_CHAPTERS.length} available now (${builtMinutes} min) · the rest are on their way`}
        </div>
      </div>

      {/* Syllabus */}
      {ACTS.map((act) => {
        const chapters = CHAPTERS.filter((c) => c.act === act.num);
        const accent = chapters[0]?.accent;
        return (
          <div key={act.num} style={{ marginTop: SPACE.xl }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: SPACE.sm, marginBottom: 6 }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: accent }}>
                ACT {["I", "II", "III", "IV", "V"][act.num - 1]}
              </span>
              <h2 style={{ fontSize: TYPE.h3, fontWeight: 500 }}>{act.title}</h2>
            </div>
            <p style={{ fontSize: 15, color: COLORS.muted, marginBottom: SPACE.sm, fontStyle: "italic" }}>
              {act.blurb}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {chapters.map((ch) => (
                <ChapterCard key={ch.id} ch={ch} progress={progress} navigate={navigate} mobile={mobile} />
              ))}
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: SPACE.xl, paddingTop: SPACE.md, borderTop: `1px solid ${COLORS.hairline}` }}>
        <p style={{ fontSize: 14, color: COLORS.faint, lineHeight: 1.7 }}>
          Every demo in this course calls real AI models — nothing is simulated. Where we
          simplify, we say so. Progress is saved on this device.
        </p>
      </div>
    </div>
  );
}
